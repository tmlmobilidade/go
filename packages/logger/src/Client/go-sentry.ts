import * as Sentry from '@sentry/node';

import { LoggerError } from '../Logger/LoggerError/index.js';

export class GoSentryClient {
	//

	private static _instance: null | Promise<GoSentryClient> = null;

	private client: typeof Sentry;

	/**
	 * Disallow direct instantiation of the services.
	 * Use GoSentryClient.getClient() instead to ensure singleton behavior.
	 */
	private constructor() {}

	/**
	 * Returns the singleton instance of the service.
	 */
	public static async getClient() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getClient() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new GoSentryClient();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.connect();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		const instance = await this._instance;
		return instance.client;
	}

	/**
	 * Connects to Sentry, setting up the client instance.
	 * This method is called internally by the GoSentryClient and should not be used directly.
	 */
	private async connect() {
		if (!process.env.SENTRY_DSN) throw new Error('Missing SENTRY_DSN');
		LoggerError({
			message: '[GoSentryClient] Connecting to Sentry...',
			request: null,
		});
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.ENVIRONMENT,
			tracesSampleRate: 1.0,
		});
		this.client = Sentry;
	}
}
