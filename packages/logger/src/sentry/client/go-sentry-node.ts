import * as Sentry from '@sentry/node';

export class GoSentryClient {
	//

	private static _instance: null | Promise<GoSentryClient> = null;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getClient() instead to ensure singleton behavior.
	 */
	private constructor() {}

	public static async getClient() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getClient() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new GoSentryClient();
				await instance.connect();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		const instance = await this._instance;
		return instance;
	}

	private async connect() {
		//

		//
		// Initialize Sentry

		const connectionString = await this.getConnectionString();
		Sentry.init({ dsn: connectionString });
	}

	private async getConnectionString(): Promise<string> {
		//

		//
		// Validate required environment variables

		if (!process.env.SENTRY_DSN) {
			throw new Error('Missing SENTRY_DSN, please set the SENTRY_DSN environment variable for this work my friend!');
		}

		return process.env.SENTRY_DSN;
	}
}
