/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { readFileSync } from 'node:fs';
import { IncomingMessage } from 'node:http';
import https from 'node:https';

/* * */

interface CPAuthTokenResponse {
	access_token: string
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
}

/* * */

export class CPAuthClient {
	//

	private static _instance: null | Promise<CPAuthClient> = null;

	private expiresAt: number = 0;
	private token: null | string = null;
	private tunnel: null | SshTunnelService = null;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getToken() instead to ensure singleton behavior.
	 */
	private constructor() {}

	public async getToken() {
		if (!this.token) {
			Logger.info('[CPAuthClient] No token found, fetching a new one...');
			await this.connect();
		}
		if (this.expiresAt - Date.now() < 60 * 1000) {
			Logger.info('[CPAuthClient] Token is about to expire, refreshing...');
			await this.connect();
		}
		return this.token;
	}

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new CPAuthClient();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.connect();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		return await this._instance;
	}

	private async connect() {
		//

		Logger.info('[CPAuthClient] Connecting and fetching token...');

		//
		// Get the authentication URL, which also sets up the SSH tunnel if needed.

		const port = await this.getAuthenticationPort();

		//
		// Make the POST request to the Authentication API through the SSH tunnel,
		// and handle the response, extracting the access token or throwing an error if the request fails.

		const responseResult = await new Promise<CPAuthTokenResponse>((resolve, reject) => {
			//

			const requestBody = new URLSearchParams({
				client_id: process.env.TRACKER_CP_AUTH_CLIENT_ID,
				client_secret: process.env.TRACKER_CP_AUTH_CLIENT_SECRET,
				grant_type: 'client_credentials',
			}).toString();

			const requestOptions: https.RequestOptions = {
				headers: {
					'Content-Length': Buffer.byteLength(requestBody),
					'Content-Type': 'application/x-www-form-urlencoded',
					'host': process.env.TRACKER_CP_AUTH_HOST,
				},
				host: 'localhost',
				method: 'POST',
				path: process.env.TRACKER_CP_AUTH_PATH,
				port: port,
				rejectUnauthorized: false,
				servername: process.env.TRACKER_CP_AUTH_HOST,
			};

			const callback: (res: IncomingMessage) => void = (response) => {
				const chunks: Buffer[] = [];
				response.on('data', chunk => chunks.push(chunk));
				response.on('end', () => {
					const responseText = Buffer.concat(chunks).toString('utf8');
					if (response.statusCode < 200 || response.statusCode >= 300) {
						reject(new Error(`[CPAuthClient] Token request failed (${response.statusCode}): ${responseText.slice(0, 500)}`));
						return;
					}
					try {
						resolve(JSON.parse(responseText));
					} catch {
						reject(new Error(`[CPAuthClient] Token response is not JSON: ${responseText.slice(0, 500)}`));
					}
				});
			};

			const request = https.request(requestOptions, callback);

			request.on('error', reject);
			request.write(requestBody);
			request.end();
		});

		//
		// With the response data, set the token and calculate the expiration time
		// based on the current time and the expires_in value from the response.

		this.expiresAt = Date.now() + (responseResult.expires_in * 1000);
		this.token = responseResult.access_token;
	}

	/**
	 * Constructs the authentication URL based on environment variables
	 * and SSH tunneling configuration, and handles both direct connections and SSH-tunneled
	 * connections, validating the necessary environment variables for each case.
	 * This method is called internally by the service and should not be used directly.
	 * @throws Will throw an error if required environment variables are missing or if the SSH tunnel setup fails.
	 * @returns A promise that resolves to the authentication URL.
	 */
	private async getAuthenticationPort(): Promise<number> {
		//

		//
		// Validate required environment variables

		if (!process.env.TRACKER_CP_AUTH_HOST || !process.env.TRACKER_CP_AUTH_PATH) {
			throw new Error('Missing TRACKER_CP_AUTH_HOST or TRACKER_CP_AUTH_PATH environment variables.');
		}

		if (!process.env.TRACKER_CP_AUTH_CLIENT_ID || !process.env.TRACKER_CP_AUTH_CLIENT_SECRET) {
			throw new Error('Missing TRACKER_CP_AUTH_CLIENT_ID or TRACKER_CP_AUTH_CLIENT_SECRET environment variables.');
		}

		if (!process.env.TRACKER_CP_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing TRACKER_CP_TUNNEL_LOCAL_PORT environment variable.');
		}

		if (!process.env.TRACKER_CP_TUNNEL_SSH_HOST || !process.env.TRACKER_CP_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing TRACKER_CP_TUNNEL_SSH_HOST or TRACKER_CP_TUNNEL_SSH_USERNAME environment variables.');
		}

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.TRACKER_CP_AUTH_HOST,
				dstPort: 443,
				srcAddr: 'localhost',
				srcPort: Number(process.env.TRACKER_CP_TUNNEL_LOCAL_PORT),
			},
			serverOptions: {
				port: Number(process.env.TRACKER_CP_TUNNEL_LOCAL_PORT),
			},
			sshOptions: {
				agent: process.env.TRACKER_CP_TUNNEL_SSH_KEY_PATH ? undefined : process.env.SSH_AUTH_SOCK,
				host: process.env.TRACKER_CP_TUNNEL_SSH_HOST,
				keepaliveCountMax: 20,
				keepaliveInterval: 10_000,
				port: 22,
				privateKey: process.env.TRACKER_CP_TUNNEL_SSH_KEY_PATH ? readFileSync(process.env.TRACKER_CP_TUNNEL_SSH_KEY_PATH) : process.env.TRACKER_CP_TUNNEL_SSH_KEY,
				username: process.env.TRACKER_CP_TUNNEL_SSH_USERNAME,
			},
			tunnelOptions: {
				autoClose: false,
				reconnectOnError: true,
			},
		};

		const sshOptions: SshTunnelServiceOptions = {
			maxRetries: 3,
		};

		if (!this.tunnel) {
			this.tunnel = new SshTunnelService(sshConfig, sshOptions);
			await this.tunnel.connect();
		}

		Logger.info('[CPAuthClient] Setting up SSH Tunnel...');

		const addr = this.tunnel.server.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('[CPAuthClient] Failed to retrieve SSH tunnel address.');
		}

		return addr.port;
	}

	//
}

/* * */

export const cpAuthClient = asyncSingletonProxy(CPAuthClient);
