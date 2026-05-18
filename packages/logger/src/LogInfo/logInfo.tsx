import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

export interface LogInfoContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	stopId?: number
}

export const logInfo = (context: LogInfoContext & { request?: FastifyRequest }) => {
	const { action, email, feature, message, request, stopId, ...extra } = context;
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureMessage(message, {
			...extra,
			endpoint: request?.url,
			level: 'info',
			message,
			method: request?.method,
			tags: {
				action,
				email,
				feature,
				stopId,
			},
		});
	});
};
