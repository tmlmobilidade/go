/**
 * ErrorIssue utility for creating Sentry issues.
 *
 * Captures an error as an issue in Sentry with contextual tags.
 * This is intended for use in backends where issue tracking should stay separate from log events.
 *
 * @module ErrorIssue
 */

import * as Sentry from '@sentry/core';

/**
 * Context object for structured error logging.
 *
 * @property {string} message      - Description of the error or relevant details.
 * @property {string} [method]   - HTTP method associated with the error (optional).
 * @property {string} [request]  - The endpoint/request context, typically a URL or route (optional).
 * @property {unknown} [value]   - Optionally ties the error to a specific value (e.g., entity ID, payload) (optional).
 * @property {object} [key: string] - Any additional relevant metadata or fields (optional).
 */
export interface LogErrorContext {
	[key: string]: unknown
	message: string
	method?: string
	request?: string
	value?: unknown
}

/**
 * Logs an error with context to Sentry.
 * Any extra fields on the context object are forwarded as additional metadata.
 *
 * @param {LogErrorContext} context - Object containing error message and context for reporting to Sentry.
 * @returns void
 *
 * @example
 * // Logs example (structured error log)
 * LoggerError({
 *   message: 'Failed to create stop',
 *   method: 'POST',
 *   request: '/stops/create',
 *   value: { stopId: 123456 }
 * });
 */
export const LoggerError = (context: LogErrorContext): void => {
	const { message, method, request, value } = context;
	const normalizedValueTag = value === undefined || value === null
		? undefined
		: typeof value === 'string'
			? value
			: JSON.stringify(value);

	Sentry.captureMessage(message, {
		extra: {
			...context,
			method,
			request,
			value,
		},
		level: 'error',
		tags: {
			method: method ?? '',
			request: request ?? '',
			value: normalizedValueTag,
		},
	});
};
