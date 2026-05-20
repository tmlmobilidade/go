/**
 * Type definition for Sentry's core methods we utilize.
 * Matches the API provided by @sentry/node for error and info tracking.
 */
interface SentryModule {
	/**
	 * Reports a message (title and context) to Sentry.
	 */
	captureMessage: (title: string, context?: unknown) => void

	/**
	 * Internal: Gets the currently initialized Sentry client,
	 * returns undefined/null if not initialized.
	 */
	getClient: () => unknown

	/**
	 * Initializes Sentry when called in a Node.js context.
	 * Passes DSN, environment, and traces sampling to Sentry.
	 */
	init: (options: {
		dsn?: string
		environment?: string
		tracesSampleRate: number
	}) => void
}

/**
 * Singleton promise for loading the Sentry SDK module asynchronously.
 * Ensures single initialization and import of Sentry in the server runtime.
 */
let SENTRY_MODULE_PROMISE: null | Promise<null | SentryModule> = null;

/**
 * Utility to determine if code is executing in a server (non-browser) environment.
 * Prevents Sentry SDK loading in client-side/browser builds.
 */
const isServerRuntime = () =>
	typeof process !== 'undefined' &&
	typeof (globalThis as { window?: unknown }).window === 'undefined';

/**
 * Loads and returns the Sentry client if running in a Node.js server context.
 * Initializes Sentry if not yet initialized and memoizes the client for reuse.
 *
 * Will *not* import or initialize Sentry on the client/browser.
 * - Returns `null` if in the client or if Sentry fails to import.
 * - Otherwise returns the loaded Sentry module.
 *
 * @returns {Promise<SentryModule|null>} Loaded Sentry module, or `null` if unavailable.
 */
export const getSentryClient = async (): Promise<null | SentryModule> => {
	if (!isServerRuntime()) return null;

	if (!SENTRY_MODULE_PROMISE) {
		// Dynamic import wrapped in a function constructor avoids static analyzers during client build
		const dynamicImport = new Function(
			'modulePath',
			'return import(modulePath)',
		) as (modulePath: string) => Promise<SentryModule & { default?: SentryModule }>;

		SENTRY_MODULE_PROMISE = dynamicImport('@sentry/node')
			.then((module) => {
				// Sentry SDK may export via default or named export
				const sentry = module.default ?? module;
				// Only initialize if there is not already a Sentry client instance
				if (!sentry.getClient()) {
					sentry.init({
						dsn: process.env.SENTRY_DSN,
						environment: process.env.ENVIRONMENT,
						tracesSampleRate: 1.0,
					});
				}
				return sentry;
			})
			.catch(() => null); // Fail gracefully if Sentry cannot be imported
	}

	return SENTRY_MODULE_PROMISE;
};
