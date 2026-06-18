import * as Sentry from '@sentry/core';

export type GlobalIssueLevel = 'debug' | 'error' | 'fatal' | 'info' | 'warning';

export interface GlobalIssueRequestContext {
	me?: { email?: string }
	method?: string
	routeOptions?: { url?: string }
	url?: string
}

export interface GlobalIssueContext {
	[key: string]: unknown
	action?: string
	email?: string
	error?: Error
	feature?: string
	level?: GlobalIssueLevel
	message?: string
	request?: GlobalIssueRequestContext
	service?: string
	status?: number
	value?: unknown
}

export function globalIssue(context: GlobalIssueContext): void {
	//

	//
	// Normalize the request context

	const requestContext = context.request;
	const routeUrl = requestContext?.routeOptions?.url;
	const requestUrl = requestContext?.url;
	const requestMethod = context.request?.method;
	const requestEmail = context.email ?? requestContext?.me?.email;
	const normalizedLevel = context.level ?? 'info';
	const normalizedMessage = context.message ?? context.error?.message ?? 'Unknown issue';
	const normalizedValueTag = context.value === undefined || context.value === null
		? undefined
		: typeof context.value === 'string'
			? context.value
			: JSON.stringify(context.value);
	const errorStatusCode = (context.error as undefined | { statusCode?: unknown })?.statusCode;
	const statusCode = context.status ?? (typeof errorStatusCode === 'number'
		? Number(errorStatusCode)
		: undefined);

	//
	// Create the sentry context

	const sentryContext = {
		...context,
		extra: {
			...context,
			email: requestEmail,
			endpoint: routeUrl ?? context.request?.url,
			message: normalizedMessage,
			method: requestMethod,
			path: routeUrl ?? requestUrl,
			request: requestUrl,
			value: context.value,
		},
		level: normalizedLevel,
		tags: {
			action: context.action,
			email: context.email,
			feature: context.feature,
			level: normalizedLevel,
			method: requestMethod,
			path: routeUrl ?? requestUrl,
			request: requestUrl,
			status: statusCode,
			value: normalizedValueTag,
		},
	};

	//
	// Capture the issue

	if (normalizedLevel === 'error' || normalizedLevel === 'fatal' || context.error) {
		Sentry.captureException(context.error ?? new Error(normalizedMessage), sentryContext);
		return;
	}

	//
	// Capture the message

	Sentry.captureMessage(normalizedMessage, sentryContext);
};
