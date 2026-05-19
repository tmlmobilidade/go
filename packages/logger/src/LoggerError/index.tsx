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
 * @property {unknown} [value] - Optionally tie the error to a specific value.
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
	value?: unknown
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
 *   value: { stopId: 123456 }
 * });
 */
export const LoggerError = (context: LogErrorContext): void => {
	const { action, email, error, feature, message, request, value, ...extra } = context;
	const routeUrl = (request as FastifyRequest & { routeOptions?: { url?: string } }).routeOptions?.url;
	const transactionName = `${request.method} ${routeUrl ?? request.url}`;
	const normalizedValueTag = value === undefined || value === null
		? undefined
		: typeof value === 'string' ? value : JSON.stringify(value);
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureException(error instanceof Error ? error : new Error(message), {
			extra: {
				...extra,
				endpoint: request.url,
				message,
				method: request.method,
				originalErrorMessage: error instanceof Error ? error.message : undefined,
				value,
			},
			tags: {
				action,
				email,
				feature,
				value: normalizedValueTag,
			},
			transactionName,
		});
	});
};
