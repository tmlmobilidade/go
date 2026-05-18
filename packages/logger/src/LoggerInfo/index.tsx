/**
 * LoggerInfo utility for logging information messages to Sentry.
 *
 * This function sends structured messages to Sentry via captureMessage.
 * It is designed to be used on Fastify backends.
 *
 * @module LoggerInfo
 */
import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

/**
 * The context for informational log messages.
 *
 * @property {string} message - The log message (required).
 * @property {string} [action] - Optional action associated with the event.
 * @property {string} [email] - Optional user email associated with the event.
 * @property {string} [feature] - Optional feature/context for the log event.
 * @property {FastifyRequest} [request] - Optional Fastify request object for additional context.
 * @property {number} [stopId] - Optional related stop ID.
 * @property {unknown} [key] - Additional custom metadata.
 */
export interface LogInfoContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	request?: FastifyRequest
	stopId?: number
}

/**
 * Sends an informational log message to Sentry with structured context.
 * If a Sentry client is available, includes endpoint, method, tags, and any extra metadata.
 *
 * @param {LogInfoContext} context - Information to be reported. Must include a 'message' property.
 */
export const LoggerInfo = (context: LogInfoContext) => {
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
