import { getSentryClient } from '../sentry-loader.js';

interface LogContext {
	[key: string]: unknown
	action?: string
	feature?: string
}

export const logError = (error: unknown, context: LogContext = {}) => {
	const { action, feature, ...extra } = context;
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureException(error, {
			extra,
			tags: {
				action,
				feature,
			},
		});
	});
};
