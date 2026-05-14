import { getSentryClient } from '../sentry-loader.js';

export interface LogInfoContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	requestId?: string
	stopId?: number
	updatedBy?: string
}

export const logInfo = (context: LogInfoContext) => {
	const { action, email, feature, message, requestId, stopId, updatedBy, ...extra } = context;
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureMessage(message, {
			extra,
			level: 'info',
			tags: {
				action,
				email,
				feature,
				requestId,
				stopId,
				updatedBy,
			},
		});
	});
};
