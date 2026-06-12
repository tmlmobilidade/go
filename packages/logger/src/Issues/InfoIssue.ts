import * as Sentry from '@sentry/core';
import { type FastifyRequest } from 'fastify';

export interface InfoIssueContext {
	[key: string]: unknown
	action?: string
	email?: string
	feature?: string
	message: string
	request?: FastifyRequest
	status?: string
	value?: unknown
}

export const InfoIssue = (context: InfoIssueContext): void => {
	const { action, email, feature, message, request, status, value, ...extra } = context;
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
			status: status ?? '',
			value: normalizedValueTag,
		},
	});
};
