/**
 * LoggerInfo utility for logging info to Sentry.
 *
 * Logs an info with context to Sentry, including Fastify request and endpoint information.
 * Intended for use in Fastify backends or Node.js applications, providing structured contextual info reporting.
 *
 * @module LoggerInfo
 */

import * as Sentry from '@sentry/core';

/**
 * Interface representing the context object for structured info logging.
 *
 * @property {string} message    - Description of the info or relevant details.
 * @property {string} [method]   - HTTP method associated with the error (optional).
 * @property {string} [request]  - The endpoint/request context, typically a URL or route (optional).
 * @property {unknown} [value]   - Optionally ties the info to a specific value (e.g., entity ID, payload) (optional).
 * @property {object} [key: string] - Any additional relevant metadata or fields (optional).
 */
export interface LogInfoContext {
	[key: string]: unknown
	message: string
	method?: string
	request?: string
	value?: unknown
}

/**
 * Logs an info with context to Sentry.
 * Any extra fields on the context object are forwarded as additional metadata.
 *
 * @param {LogInfoContext} context - Object containing info message and context for reporting to Sentry.
 * @returns {void}
 *
 * @example
 * // Logs example (structured info log)
 * LoggerInfo({
 *   message: 'Failed to create stop',
 *   method: 'POST',
 *   request: '/stops/create',
 *   value: { stopId: 123456 }
 * });
 */
export const LoggerInfo = (context: LogInfoContext): void => {
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
		level: 'info',
		tags: {
			method: method ?? '',
			request: request ?? '',
			value: normalizedValueTag,
		},
	});
};
