/**
 * LoggerError utility for logging errors to Sentry.
 *
 * This function sends detailed error information including request context to Sentry via captureException.
 * It is designed to be used on Fastify backends.
 *
 * @module LoggerError
 */

import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

/**
 * Structured context for logging errors in the application.
 *
 * @property {string} [action] - The action being performed during the error.
 * @property {string} [email] - The email associated with the context/request/user.
 * @property {Error} [error] - The error object to be logged.
 * @property {string} [feature] - Application feature involved in the error.
 * @property {string} message - Error message or description.
 * @property {FastifyRequest} request - The FastifyRequest instance (for endpoint/method context).
 * @property {number} [stopId] - Optionally tie the error to a specific stopId entity.
 * @property {object} [key: string] - Any additional relevant context fields.
 */
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

/**
 * Sends an error and its context to the Sentry client for tracking.
 * Additional fields in context are forwarded as extra context.
 *
 * @param {LogErrorContext} context - The error context containing relevant info for Sentry.
 * @returns void
 *
 * @example
 * LoggerError({
 *   message: 'Failed to create stop',
 *   error: err,
 *   feature: 'createStop',
 *   request,
 *   action: 'create',
 *   email: user.email,
 *   stopId: 123456
 * });
 */
export const LoggerError = (context: LogErrorContext): void => {
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
