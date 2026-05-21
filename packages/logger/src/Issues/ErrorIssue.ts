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
 * Context object for structured issue reporting.
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
export interface ErrorIssueContext {
	[key: string]: unknown
	action?: string
	email?: string
	error?: Error
	feature?: string
	message: string
	method?: string
	request?: string
	service: string
	value?: unknown
}

/**
 * Captures an error issue with context in Sentry.
 * Any extra fields on the context object are forwarded as additional metadata.
 *
 * @param {ErrorIssueContext} context - The error context object containing relevant info for Sentry.
 * @returns void
 *
 * @example
 * // Issues example (create Sentry issue)
 * ErrorIssue({
 *   message: 'Failed to create stop',
 *   error: err,
 *   feature: 'stops',
 *   request: '/stops/create',
 *   action: 'create',
 *   email: user.email,
 *   value: { stopId: 123456 }
 * });
 */
export const ErrorIssue = (context: ErrorIssueContext): void => {
	const { action, email, feature, message, method, request, service, value } = context;
	const normalizedValueTag = value === undefined || value === null
		? undefined
		: typeof value === 'string'
			? value
			: JSON.stringify(value);

	// Send the issue to Sentry (ErrorIssue)
	Sentry.captureException(message, {
		...context,
		level: 'error',
		tags: {
			action,
			email,
			feature,
			method,
			request,
			service,
			value: normalizedValueTag,
		},
	});
};
