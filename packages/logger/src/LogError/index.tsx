import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

interface LogContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	request?: FastifyRequest
	stopId?: number
}

export const logError = (error: unknown, context: LogContext & { request?: FastifyRequest }) => {
	const { action, email, feature, message, request, stopId, ...extra } = context;
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureException(error, {
			...extra,
			endpoint: request?.url,
			level: 'error',
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
