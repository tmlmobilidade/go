import * as Sentry from '@sentry/node';

/* * */

export interface LogsNodeContext {
	[key: string]: unknown
	app: string
	message: string
	method?: string
	module: string
	path?: string
	reqId?: string
	severity?: string
	status?: string
}

/* * */

export function startNodeLogs(context: LogsNodeContext): void {
	const requestData = normalizeRequestContext(context.request);
	const payload = {
		...context,
		...requestData,
		severity: normalizeSeverity(context.severity),
	};
	const level = normalizeSeverity(context.severity);

	if (level === 'debug') {
		Sentry.logger.debug(context.message, payload);
		return;
	}

	if (level === 'warn') {
		Sentry.logger.warn(context.message, payload);
		return;
	}

	if (level === 'error') {
		Sentry.logger.error(context.message, payload);
		return;
	}

	Sentry.logger.info(context.message, payload);
	Sentry.getGlobalScope().setAttributes({ app: context.app, module: context.module });
};

function normalizeSeverity(severity: string | undefined): 'debug' | 'error' | 'info' | 'warn' {
	if (severity === 'debug' || severity === 'error' || severity === 'warn') return severity;
	return 'info';
}

function normalizeRequestContext(request: unknown): { endpoint?: string, method?: string, request?: string } {
	if (!request || typeof request !== 'object') return {};
	const maybeRequest = request as {
		method?: unknown
		routeOptions?: { url?: unknown }
		url?: unknown
	};
	const method = typeof maybeRequest.method === 'string' ? maybeRequest.method : undefined;
	const requestUrl = typeof maybeRequest.url === 'string' ? maybeRequest.url : undefined;
	const routeUrl = typeof maybeRequest.routeOptions?.url === 'string' ? maybeRequest.routeOptions.url : undefined;
	return {
		...(routeUrl || requestUrl ? { endpoint: routeUrl ?? requestUrl } : {}),
		...(method ? { method } : {}),
		...(requestUrl ? { request: requestUrl } : {}),
	};
}
