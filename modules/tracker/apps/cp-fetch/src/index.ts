/* * */

import type { AddressInfo } from 'node:net';

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventCpV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import https from 'node:https';

/* * */

const API_URL = 'https://api-gateway.cp.pt/cp/partner/gtfs-partners/realtime/VehiclePositions.pb';
const API_TOKEN_URL = 'https://login-qua2.cp.pt/realms/api-auth/protocol/openid-connect/token';
const CP_AUTH_HOST = 'login-qua2.cp.pt';
const TUNNEL_HOST = '127.0.0.1';
const TUNNEL_PORT = 6666;
const TOKEN_REFRESH_SKEW_MS = 5_000;
const AGENCY_ID = '3';
const VERSION = 'cp-v1';

/* * */

interface TokenResponse {
	access_token: string
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
}

let ITERATION = 0;

let API_TOKEN: TokenResponse | undefined = undefined;

/* * */

const shouldRefreshToken = (token?: TokenResponse) => !token || token.expires_in < Date.now();

const getTunnelPort = (tunnel: SshTunnelService, localPort: number) => {
	const addr = tunnel.server?.address();
	if (addr && typeof addr === 'object') return (addr as AddressInfo).port;
	return localPort;
};

const fetchCpToken = async (tunnelPort: number): Promise<TokenResponse> => {
	const { pathname, search } = new URL(API_TOKEN_URL);
	const body = new URLSearchParams({
		client_id: process.env.CP_CLIENT_ID || '',
		client_secret: process.env.CP_CLIENT_SECRET || '',
		grant_type: 'client_credentials',
	}).toString();

	return new Promise((resolve, reject) => {
		const request = https.request({
			headers: {
				'Content-Length': Buffer.byteLength(body),
				'Content-Type': 'application/x-www-form-urlencoded',
				'host': CP_AUTH_HOST,
			},
			host: '127.0.0.1',
			method: 'POST',
			path: `${pathname}${search}`,
			port: tunnelPort,
			rejectUnauthorized: false,
			servername: CP_AUTH_HOST,
		}, (response) => {
			const chunks: Buffer[] = [];
			response.on('data', chunk => chunks.push(chunk));
			response.on('end', () => {
				const text = Buffer.concat(chunks).toString('utf8');
				const statusCode = response.statusCode ?? 0;

				if (statusCode < 200 || statusCode >= 300) {
					reject(new Error(`CP token request failed (${statusCode}): ${text.slice(0, 500)}`));
					return;
				}

				try {
					resolve(JSON.parse(text) as TokenResponse);
				} catch {
					reject(new Error(`CP token response is not JSON: ${text.slice(0, 500)}`));
				}
			});
		});

		request.on('error', reject);
		request.write(body);
		request.end();
	});
};

const refreshToken = async (tunnelPort: number): Promise<TokenResponse> => {
	const tokenResponseData = await fetchCpToken(tunnelPort);
	return {
		access_token: tokenResponseData.access_token,
		expires_in: (Dates.now('Europe/Lisbon').unix_timestamp + tokenResponseData.expires_in * 1000) - TOKEN_REFRESH_SKEW_MS,
		refresh_token: tokenResponseData.refresh_token,
		scope: tokenResponseData.scope,
		token_type: tokenResponseData.token_type,
	};
};

const hashRawEvent = (rawEvent: HashableRawVehicleEvent<RawVehicleEventCpV1>) => crypto
	.createHash('sha256')
	.update(JSON.stringify(rawEvent))
	.digest('hex');

const saveVehicleEvents = async (
	rawEntities: Awaited<ReturnType<typeof decodeGtfsRtFeed>>['entity'] | undefined,
	header: Awaited<ReturnType<typeof decodeGtfsRtFeed>>['header'],
) => {
	let saveCount = 0;

	for (const entity of rawEntities ?? []) {
		const vehicle = entity.vehicle;
		if (!vehicle?.trip) continue;

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventCpV1> = {
			agency_id: AGENCY_ID,
			created_at: Dates.fromSeconds(Number(vehicle.timestamp)).unix_timestamp,
			entity_id: entity.id,
			payload: {
				header,
				vehicle,
			},
			version: VERSION,
		};

		const hashableRawEventId = hashRawEvent(hashableRawEvent);
		const alreadyExists = await rawVehicleEventsNew.findOne({ _id: hashableRawEventId });
		if (alreadyExists) continue;

		await rawVehicleEventsNew.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;
	}

	return saveCount;
};

/* * */

const main = async () => {
	const timer = new Timer();

	const sshConfig: SshConfig = {
		forwardOptions: {
			srcAddr: TUNNEL_HOST,
			srcPort: TUNNEL_PORT,
			// Remote destination reachable from jump server.
			dstAddr: CP_AUTH_HOST,
			dstPort: 443,
		},
		serverOptions: {
			host: TUNNEL_HOST,
			port: TUNNEL_PORT,
		},
		sshOptions: {
			agent: process.env.GO_TUNNEL_SSH_KEY_PATH || process.env.GO_TUNNEL_SSH_KEY ? undefined : process.env.SSH_AUTH_SOCK,
			host: process.env.GO_TUNNEL_SSH_HOST,
			keepaliveCountMax: 3,
			keepaliveInterval: 10_000,
			port: 22,
			privateKey: process.env.GO_TUNNEL_SSH_KEY_PATH ? readFileSync(process.env.GO_TUNNEL_SSH_KEY_PATH) : process.env.GO_TUNNEL_SSH_KEY,
			username: process.env.GO_TUNNEL_SSH_USERNAME,
		},
		tunnelOptions: {
			autoClose: false,
			reconnectOnError: true,
		},
	};
	const sshOptions: SshTunnelServiceOptions = {
		maxRetries: 3,
	};

	const sshTunnelService = new SshTunnelService(sshConfig, sshOptions);
	await sshTunnelService.connect();
	const tunnelPort = getTunnelPort(sshTunnelService, TUNNEL_PORT);

	Logger.info(`[${ITERATION}] Fetching CP data from API...`, 0, 1);

	if (shouldRefreshToken(API_TOKEN)) API_TOKEN = await refreshToken(tunnelPort);

	const response = await fetch(API_URL, {
		headers: {
			'Authorization': `Bearer ${API_TOKEN.access_token}`,
			'x-cp-connect-id': process.env.CP_API_KEY || '',
			'x-cp-connect-secret': process.env.CP_API_SECRET || '',
		},
	});

	const arrayBuffer = await response.arrayBuffer();
	const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

	Logger.info(`[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CP data.`);
	const saveCount = await saveVehicleEvents(decodedMessage.entity, decodedMessage.header);
	Logger.info(`[${ITERATION}] Saved ${saveCount} new Vehicle Events from CP data in ${timer.get()}.`);

	ITERATION++;
};

/* * */

await runOnInterval(main, { intervalMs: '30s', throwOnError: true });
