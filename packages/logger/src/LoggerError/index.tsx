import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

export interface LogErrorContext {
	[key: string]: unknown
	action?: string
	email?: string
	error?: Error
	feature?: string
	message: string
	request: FastifyRequest
	stopId?: number
}

export const LoggerError = (context: LogErrorContext) => {
	const { action, email, error, feature, message, request, stopId, ...extra } = context;
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureException(error instanceof Error ? error : new Error(message), {
			...extra,
			endpoint: request.url,
			message,
			method: request.method,
			originalErrorMessage: error instanceof Error ? error.message : undefined,
			tags: {
				action,
				email,
				feature,
				stopId,
			},
		});
	});
};
