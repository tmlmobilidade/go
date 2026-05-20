/**
 * LoggerError utility for logging errors to Sentry.
 *
 * Logs an error with context to Sentry, including Fastify request and endpoint information.
 * This is intended for use in Fastify backends, where detailed contextual error reporting is required.
 *
 * @module LoggerError
 */

import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../../client/sentry-loader.js';

/**
 * Context object for structured error logging.
 *
 * @property {string} [action]     - Describes the user or system action in progress when the error occurred.
 * @property {string} [email]      - The email associated with the context/request/user, if available.
 * @property {Error}  [error]      - The error object to be logged; if not provided, one is created from `message`.
 * @property {string} [feature]    - Feature or module of the application related to the error.
 * @property {string} message      - Description of the error or relevant details.
 * @property {FastifyRequest} request - The associated Fastify request for endpoint/method context.
 * @property {unknown} [value]     - Optionally tie the error to a specific value (e.g., entity id).
 * @property {object} [key: string]- Any additional relevant metadata or fields.
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
 * Logs an error with context to Sentry.
 * Any extra fields on the context object are forwarded as additional metadata.
 *
 * @param {LogErrorContext} context - The error context object containing relevant info for Sentry.
 * @returns void
 *
 * @example
 * LoggerError({
 *   message: 'Failed to create stop',
 *   error: err,
 *   feature: 'stops',
 *   request,
 *   action: 'create',
 *   email: user.email,
 *   value: { stopId: 123456 }
 * });
 */
export const LoggerError = (context: LogErrorContext): void => {
	const { action, email, error, feature, message, request, value, ...extra } = context;
	const routeUrl = request ? (request as FastifyRequest & { routeOptions?: { url?: string } }).routeOptions?.url : undefined;
	const transactionName = request ? `${request.method} ${routeUrl ?? request.url}` : undefined;
	const normalizedError = error instanceof Error ? error : new Error(message);
	const normalizedValueTag = value === undefined || value === null
		? undefined
		: typeof value === 'string' ? value : JSON.stringify(value);

	// Send the error to Sentry (LoggerError)
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureMessage(normalizedError.message, {
			...context,
			error: normalizedError,
			extra: {
				...extra,
				endpoint: routeUrl ?? request?.url,
				message,
				method: request?.method,
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
