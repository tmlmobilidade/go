import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

export interface LogErrorContext {
	[key: string]: unknown
	action?: string
	email?: string
	error?: Error
	feature?: string
	message: string
	request?: FastifyRequest
	stopId?: number
}

export const logError = (errorOrContext: unknown, context: LogErrorContext) => {
	const { action, email, feature, message, request, stopId, ...extra } = context;
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureException(errorOrContext instanceof Error ? errorOrContext : new Error(message), {
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
