/* * */

import { Logger } from '@tmlmobilidade/logger';
import { SshTunnelService } from '@tmlmobilidade/ssh';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IncomingMessage } from 'node:http';
import https from 'node:https';

/* * */

interface MLTokenResponse {
	access_token: string
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
}

/* * */

export class MLAuthClient {
	//

	private static _instance: null | Promise<MLAuthClient> = null;

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
			Logger.info('[MLAuthClient] No token found, fetching a new one...');
			await this.connect();
		}
		if (this.expiresAt - Date.now() < 60 * 1000) {
			Logger.info('[MLAuthClient] Token is about to expire, refreshing...');
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
				const instance = new MLAuthClient();
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

		Logger.info('[MLAuthClient] Connecting and fetching token...');

		//
		// Make the POST request to the Authentication API through the SSH tunnel,
		// and handle the response, extracting the access token or throwing an error if the request fails.

		const requestBody = new URLSearchParams({
			grant_type: 'password',
			password: process.env.ML_PASSWORD,
			username: process.env.ML_USERNAME,
		}).toString();

		const data = await new Promise<MLTokenResponse>((resolve, reject) => {
			//

			const requestOptions: https.RequestOptions = {
				allowPartialTrustChain: true,
				headers: {
					'Authorization': `Basic ${Buffer.from(`${process.env.ML_CLIENT_ID}:${process.env.ML_CLIENT_SECRET}`).toString('base64')}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				hostname: 'api.metrolisboa.pt',
				method: 'POST',
				path: '/token',
				port: 8243,
				rejectUnauthorized: false,
				servername: 'api.metrolisboa.pt',
			};

			const callback: (res: IncomingMessage) => void = (response) => {
				const chunks: Buffer[] = [];
				response.on('data', chunk => chunks.push(chunk));
				response.on('end', () => {
					const responseText = Buffer.concat(chunks).toString('utf8');
					if (response.statusCode < 200 || response.statusCode >= 300) {
						reject(new Error(`[MlClient] Request failed (${response.statusCode}): ${responseText.slice(0, 500)}`));
						return;
					}
					try {
						resolve(JSON.parse(responseText));
					} catch {
						reject(new Error(`[MlClient] Response is not JSON: ${responseText.slice(0, 500)}`));
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

		this.expiresAt = Date.now() + (data.expires_in * 1000);
		this.token = data.access_token;
	}
}

/* * */

export const mlAuthClient = asyncSingletonProxy(MLAuthClient);
