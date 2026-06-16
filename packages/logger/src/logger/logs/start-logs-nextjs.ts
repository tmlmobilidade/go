/* * */

import { type LogsNextjsContext } from '../interface/logs-nextjs.js';

/* * */

/**
 * Prepares and normalizes the context for starting Next.js logs.
 *
 * This function is a wrapper for initializing the logging context,
 * ensuring required fields ('app', 'message', 'module', 'severity') are present.
 * The 'severity' property defaults to 'info' if not provided.
 *
 * @param context - Partial context for logs, must include app, message, module, and severity.
 *   - app: string - Application name
 *   - message: string - Main log message
 *   - module: string - Module/source of the log
 *   - severity: string - Log severity (defaults to 'info' if undefined)
 *
 * Example:
 *   startLogsNextjs({ app: 'my-app', message: 'Starting…', module: 'server', severity: 'info' });
 */
export function startLogsNextjs(context: Omit<LogsNextjsContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
	const normalizedContext = {
		...context,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: context.severity ?? 'info',
	};

	return startLogsNextjs(normalizedContext);
}
