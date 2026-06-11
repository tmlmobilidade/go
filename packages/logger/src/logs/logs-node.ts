import * as Sentry from '@sentry/node';

/**
 * Provides a context type for logging in Node.js environments.
 *
 * @interface LogsNodeContext
 * @property {string} app      - Name of the application generating the log.
 * @property {string} message    - Log message to record.
 * @property {string} module   - Name of the module related to the log event.
 * @property {string} severity - Optional severity level of the log (e.g., info, warning, error).
 * @property {unknown} [key: string] - Extendable for any additional context information.
 */

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

/**
 * Logs a message using Sentry's logger in a Node.js environment.
 *
 * @param {LogsNodeContext} context - Contextual information about the log event.
 * @returns {void}
 */
export const LogsNode = (context: LogsNodeContext): void => {
	const { app, message, method, module, path, reqId, request, severity, status, ...extra } = context;
	const requestData = normalizeRequestContext(request);
	const payload = {
		...extra,
		...requestData,
		app,
		message,
		module,
		'sentry.origin': 'manual.log.tml',
		'severity': normalizeSeverity(severity),
		...(method ? { method } : {}),
		...(path ? { path } : {}),
		...(reqId ? { reqId } : {}),
		...(typeof status === 'string' ? { status } : {}),
	};
	const level = normalizeSeverity(severity);

	if (level === 'debug') {
		Sentry.logger.debug(message, payload);
		return;
	}

	if (level === 'warn') {
		Sentry.logger.warn(message, payload);
		return;
	}

	if (level === 'error') {
		Sentry.logger.error(message, payload);
		return;
	}

	Sentry.logger.info(message, payload);
	Sentry.getGlobalScope().setAttributes({ app, module });
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
