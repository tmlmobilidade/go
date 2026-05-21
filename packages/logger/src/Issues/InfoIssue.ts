/**
 * InfoIssue utility for creating informational issues/messages in Sentry.
 *
 * Captures an informational message as an issue-style event in Sentry with contextual tags.
 * This is intended for use when issue/event tracking should stay separate from logger events.
 *
 * @module InfoIssue
 */

import * as Sentry from '@sentry/core';
import { type FastifyRequest } from 'fastify';

/**
 * Context object for structured info issue reporting.
 *
 * @property {string} message            - The main issue message (required).
 * @property {string} [action]           - The action in progress when the event occurred.
 * @property {string} [email]            - User email associated with the event.
 * @property {string} [feature]          - Application feature/module associated with the event.
 * @property {FastifyRequest} [request]  - Fastify request to enrich method/route context.
 * @property {unknown} [value]           - Related entity id, reference, or other value.
 * @property {object} [key: string]      - Any extra metadata fields.
 */
export interface InfoIssueContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	request?: FastifyRequest
	service: string
	value?: unknown
}

/**
 * Captures an informational issue/event in Sentry.
 *
 * @param {InfoIssueContext} context - Issue context (must include `message`)
 *
 * @example
 * // Issues example (capture Sentry info issue/event)
 * InfoIssue({
 *   message: 'Alert payload is missing optional metadata',
 *   feature: 'alerts',
 *   action: 'read',
 *   request,
 *   value: { alertId: 123456 }
 * });
 */
export const InfoIssue = (context: InfoIssueContext): void => {
	const { action, email, feature, message, request, service, value, ...extra } = context;
	const routeUrl = request ? (request as FastifyRequest & { routeOptions?: { url?: string } }).routeOptions?.url : undefined;
	const normalizedValueTag =
		value === undefined || value === null
			? undefined
			: typeof value === 'string'
				? value
				: JSON.stringify(value);

	Sentry.captureMessage(message, {
		...context,
		extra: {
			...extra,
			endpoint: routeUrl ?? request?.url,
			message,
			method: request?.method,
			value,
		},
		level: 'info',
		tags: {
			action,
			email,
			feature,
			method: request?.method ?? '',
			request: request?.url ?? '',
			service,
			value: normalizedValueTag,
		},
	});
};
