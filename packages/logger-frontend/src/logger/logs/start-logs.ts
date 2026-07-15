/* * */

import * as Sentry from '@sentry/nextjs';

import { type LogsContext } from '../interface/logs.js';
import { getRuntimeLogContext } from '../utils/runtime-log-context.js';

/* * */

type StartLogsContext = Omit<LogsContext, 'app' | 'message' | 'module' | 'severity'> & {
	app?: string
	message: string
	module?: string
	severity?: string
};

/* * */

/**
 * Prepares and normalizes the context for starting browser logs.
 *
 * This function serves as a wrapper for initializing the logging context,
 * using the app/module configured by initSentry when they are not supplied.
 * The 'severity' property defaults to 'info' if not supplied.
 *
 * @param context - Context for logs.
 *   - app: string - Application name, defaults to frontend
 *   - message: string - Main log message
 *   - module: string - Module/source of the log, defaults to the configured module
 *   - severity: string - Log severity (defaults to 'info' if undefined)
 *
 * Example:
 *   startLogs({ message: 'Booting...' });
 */
export function startLogs(context: StartLogsContext): void {
	const runtimeContext = getRuntimeLogContext(context);
	const severity = normalizeSeverity(context.severity);
	const payload = {
		...context,
		...runtimeContext,
		severity,
	};

	Sentry.getGlobalScope().setAttributes(runtimeContext);

	if (severity === 'debug') {
		Sentry.logger.debug(context.message, payload);
		return;
	}

	if (severity === 'warn') {
		Sentry.logger.warn(context.message, payload);
		return;
	}

	if (severity === 'error') {
		Sentry.logger.error(context.message, payload);
		return;
	}

	Sentry.logger.info(context.message, payload);
}

function normalizeSeverity(severity: string | undefined): 'debug' | 'error' | 'info' | 'warn' {
	if (severity === 'debug' || severity === 'error' || severity === 'warn') return severity;
	return 'info';
}
