/* * */

import { Logger } from '@tmlmobilidade/logger';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

/* * */

interface FertagusTokenResponse {
	access_token: string
	expires_in: number
	refresh_token: string
	scope: string
	token_type: string
}

/* * */

export class FertagusAuthClient {
	//

	private static _instance: null | Promise<FertagusAuthClient> = null;

	private expiresAt: number = 0;
	private token: null | string = null;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getToken() instead to ensure singleton behavior.
	 */
	private constructor() {}

	public async getToken() {
		if (!this.token) {
			Logger.info({ message: '[FertagusAuthClient] No token found, fetching a new one...' });
			await this.connect();
		}
		if (this.expiresAt - Date.now() < 60 * 1000) {
			Logger.info({ message: '[FertagusAuthClient] Token is about to expire, refreshing...' });
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
				const instance = new FertagusAuthClient();
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

		Logger.info({ message: '[FertagusAuthClient] Connecting and fetching token...' });

		//
		// Make the POST request to the Authentication API through the SSH tunnel,
		// and handle the response, extracting the access token or throwing an error if the request fails.

		const requestBody = new URLSearchParams({
			client_id: process.env.FERTAGUS_AUTH_USERNAME,
			client_secret: process.env.FERTAGUS_AUTH_PASSWORD,
			grant_type: 'client_credentials',
		}).toString();

		const response = await fetch(process.env.FERTAGUS_AUTH_URL, {
			body: requestBody,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			method: 'POST',
		});

		if (!response.ok) {
			throw new Error(`[FertagusAuthClient] Token request failed (${response.status}): ${response.statusText}`);
		}

		const data = await response.json() as FertagusTokenResponse;

		//
		// With the response data, set the token and calculate the expiration time
		// based on the current time and the expires_in value from the response.

		this.expiresAt = Date.now() + (data.expires_in * 1000);
		this.token = data.access_token;
	}
}

/* * */

export const fertagusAuthClient = asyncSingletonProxy(FertagusAuthClient);
