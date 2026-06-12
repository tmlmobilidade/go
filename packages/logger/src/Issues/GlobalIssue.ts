import * as Sentry from '@sentry/core';
import { type FastifyRequest } from 'fastify';

export type GlobalIssueLevel = 'debug' | 'error' | 'fatal' | 'info' | 'warning';

export interface GlobalIssueContext {
	[key: string]: unknown
	action?: string
	email?: string
	error?: Error
	feature?: string
	level?: GlobalIssueLevel
	message?: string
	request?: FastifyRequest
	service?: string
	status?: number
	value?: unknown
}

export const GlobalIssue = (context: GlobalIssueContext): void => {
	const { action, email, error, feature, level, message, request, status, value, ...extra } = context;
	const requestContext = request as FastifyRequest & { me?: { email?: string }, routeOptions?: { url?: string } } | undefined;
	const routeUrl = requestContext?.routeOptions?.url;
	const requestUrl = requestContext?.url;
	const requestMethod = requestContext?.method;
	const requestEmail = email ?? requestContext?.me?.email;
	const normalizedLevel = level ?? 'info';
	const normalizedMessage = message ?? error?.message ?? 'Unknown issue';
	const normalizedValueTag = value === undefined || value === null
		? undefined
		: typeof value === 'string'
			? value
			: JSON.stringify(value);
	const errorStatusCode = (error as undefined | { statusCode?: unknown })?.statusCode;
	const statusCode = status ?? (typeof errorStatusCode === 'number'
		? Number(errorStatusCode)
		: undefined);

	const sentryContext = {
		...extra,
		extra: {
			...extra,
			email: requestEmail,
			endpoint: routeUrl ?? request?.url,
			message: normalizedMessage,
			method: requestMethod,
			path: routeUrl ?? requestUrl,
			request: requestUrl,
			value,
		},
		level: normalizedLevel,
		tags: {
			action,
			email: requestEmail,
			feature,
			level: normalizedLevel,
			method: requestMethod,
			path: routeUrl ?? requestUrl,
			request: requestUrl,
			status: statusCode,
			value: normalizedValueTag,
		},
	};

	if (normalizedLevel === 'error' || normalizedLevel === 'fatal' || error) {
		Sentry.captureException(error ?? new Error(normalizedMessage), sentryContext);
		return;
	}

	Sentry.captureMessage(normalizedMessage, sentryContext);
};
