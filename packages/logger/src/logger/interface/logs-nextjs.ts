import * as Sentry from '@sentry/nextjs';

/* * */

export interface LogsNextjsContext {
	[key: string]: unknown
	app: string
	message: string
	module: string
	severity?: string
	status?: string
}

/* * */

export function startLogsNextjs(context: LogsNextjsContext): void {
	const locationData = normalizeLocationContext();
	const payload = {
		...context,
		...locationData,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: normalizeSeverity(context.severity),
		status: context.status,
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

function normalizeLocationContext(): { pathname?: string } {
	if (!('window' in globalThis)) return {};
	const pathname = (globalThis as typeof globalThis & { window: { location: { pathname: string } } }).window.location.pathname;
	return { pathname };
}
