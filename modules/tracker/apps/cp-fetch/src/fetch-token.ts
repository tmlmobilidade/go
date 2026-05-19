/* * */

import { Dates } from '@tmlmobilidade/dates';
import https from 'node:https';

/* * */

const API_TOKEN_URL = 'https://login-qua2.cp.pt/realms/api-auth/protocol/openid-connect/token';
const CP_AUTH_HOST = 'login-qua2.cp.pt';
const TOKEN_REFRESH_SKEW_MS = 5_000;

/* * */

export interface TokenResponse {
	access_token: string
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
}

/* * */
export const shouldRefreshToken = (token?: TokenResponse) => !token || token.expires_in < Date.now();

/* * */

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

export const refreshToken = async (tunnelPort: number): Promise<TokenResponse> => {
	const tokenResponseData = await fetchCpToken(tunnelPort);
	return {
		access_token: tokenResponseData.access_token,
		expires_in: (Dates.now('Europe/Lisbon').unix_timestamp + tokenResponseData.expires_in * 1000) - TOKEN_REFRESH_SKEW_MS,
		refresh_token: tokenResponseData.refresh_token,
		scope: tokenResponseData.scope,
		token_type: tokenResponseData.token_type,
	};
};
