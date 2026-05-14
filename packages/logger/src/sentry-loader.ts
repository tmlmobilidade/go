interface SentryModule {
	captureException: (error: unknown, context?: unknown) => void
	captureMessage: (message: string, context?: unknown) => void
	getClient: () => unknown
	init: (options: {
		dsn?: string
		environment?: string
		tracesSampleRate: number
	}) => void
}

let SENTRY_MODULE_PROMISE: null | Promise<null | SentryModule> = null;

const isServerRuntime = () => typeof process !== 'undefined' && typeof (globalThis as { window?: unknown }).window === 'undefined';

export const getSentryClient = async () => {
	if (!isServerRuntime()) return null;

	if (!SENTRY_MODULE_PROMISE) {
		const dynamicImport = new Function('modulePath', 'return import(modulePath)') as (modulePath: string) => Promise<SentryModule & { default?: SentryModule }>;
		SENTRY_MODULE_PROMISE = dynamicImport('@sentry/node')
			.then((module) => {
				const sentry = module.default ?? module;
				if (!sentry.getClient()) {
					sentry.init({
						dsn: process.env.SENTRY_DSN,
						environment: process.env.ENVIRONMENT,
						tracesSampleRate: 1.0,
					});
				}
				return sentry;
			})
			.catch(() => null);
	}

	return SENTRY_MODULE_PROMISE;
};
