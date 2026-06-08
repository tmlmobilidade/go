import * as Sentry from '@sentry/nextjs';

/**
 * Provides a context type for logging in Next.js environments.
 *
 * @interface LogsNextjsContext
 * @property {string} app      - Name of the application generating the log.
 * @property {string} message    - Log message to record.
 * @property {string} module   - Name of the module related to the log event.
 * @property {string} severity - Optional severity level of the log (e.g., info, warning, error).
 * @property {unknown} [key: string] - Extendable for any additional context information.
 */
export interface LogsNextjsContext {
	[key: string]: unknown
	app: string
	message: string
	module: string
	severity?: string
	status?: number
}

/**
 * Logs a message using Sentry's logger in a Next.js environment.
 *
 * @param {LogsNextjsContext} context - Contextual information about the log event.
 * @returns {void}
 */

export const LogsNextjs = (context: LogsNextjsContext): void => {
	const { app, message, module, severity, status, ...extra } = context;
	const locationData = normalizeLocationContext();
	const payload = {
		...extra,
		...locationData,
		app,
		message,
		module,
		severity: normalizeSeverity(severity),
		status,
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

function normalizeLocationContext(): { pathname?: string } {
	if (!('window' in globalThis)) return {};
	const pathname = (globalThis as typeof globalThis & { window: { location: { pathname: string } } }).window.location.pathname;
	return { pathname };
}
