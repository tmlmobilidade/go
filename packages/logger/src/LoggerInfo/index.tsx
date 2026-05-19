/**
 * LoggerInfo utility for logging informational messages to Sentry.
 *
 * Logs a structured informational message to Sentry using captureMessage.
 * Intended for usage in Fastify backend contexts, where route/method and user context
 * may be available to enrich log messages.
 *
 * @module LoggerInfo
 */

import { type FastifyRequest } from 'fastify';

import { getSentryClient } from '../sentry-loader.js';

/**
 * Structured context for LoggerInfo.
 *
 * @property {string} message            - The main log message (required).
 * @property {string} [action]           - The action in progress when logging (optional).
 * @property {string} [email]            - User email associated with the event (optional).
 * @property {string} [feature]          - Application feature/module for this log (optional).
 * @property {FastifyRequest} [request]  - (Optional) The Fastify request for method/route context.
 * @property {unknown} [value]           - (Optional) Related entity id, reference, or other value.
 * @property {object} [key: string]      - (Optional) Any extra metadata fields for log context.
 */
export interface LogInfoContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	request?: FastifyRequest
	value?: unknown
}

/**
 * Sends a structured informational message to Sentry, if available.
 *
 * Adds method, route, context tags and any supplemental metadata.
 * If `request` is present, attempts to enrich with method and route.
 *
 * @param {LogInfoContext} context - Log context (must include `message`)
 */
export const LoggerInfo = (context: LogInfoContext) => {
	const { action, email, feature, message, request, value, ...extra } = context;
	const routeUrl =
		request ? (request as FastifyRequest & { routeOptions?: { url?: string } }).routeOptions?.url : undefined;
	const transactionName = request ? `${request.method} ${routeUrl ?? request.url}` : undefined;
	const normalizedValueTag =
		value === undefined || value === null
			? undefined
			: typeof value === 'string'
				? value
				: JSON.stringify(value);
	void getSentryClient().then((sentryClient) => {
		if (!sentryClient) return;
		sentryClient.captureMessage(message, {
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
				value: normalizedValueTag,
			},
			transactionName,
		});
	});
};
