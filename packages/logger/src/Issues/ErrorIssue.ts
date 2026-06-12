import * as Sentry from '@sentry/core';
import { type FastifyRequest } from 'fastify';

export interface ErrorIssueContext {
	[key: string]: unknown
	action?: string
	email?: string
	error?: Error
	feature?: string
	message: string
	request?: FastifyRequest
	status?: string
	value?: unknown
}

export const ErrorIssue = (context: ErrorIssueContext): void => {
	const { action, email, feature, message, request, status, value, ...extra } = context;
	const routeUrl = request ? (request as FastifyRequest & { routeOptions?: { url?: string } }).routeOptions?.url : undefined;
	const normalizedValueTag = value === undefined || value === null
		? undefined
		: typeof value === 'string'
			? value
			: JSON.stringify(value);

	// Send the issue to Sentry (ErrorIssue)
	Sentry.captureException(message, {
		...context,
		extra: {
			...extra,
			endpoint: routeUrl ?? request?.url,
			message,
			method: request?.method,
			value,
		},
		level: 'error',
		tags: {
			action,
			email,
			feature,
			request: request?.url ?? '',
			status: status ?? '',
			value: normalizedValueTag,
		},
	});
};
