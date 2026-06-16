/* * */

import { type LogsNodeContext } from '../interface/logs-node.js';

/* * */

/**
 * Prepares and normalizes the context for starting Node.js logs.
 *
 * This function serves as a wrapper for initializing the logging context,
 * ensuring that the required fields ('app', 'message', 'module', 'severity') are present.
 * The 'severity' property will default to 'info' if not supplied.
 *
 * @param context - Partial context for logs, must include app, message, module, and severity.
 *   - app: string - Application name
 *   - message: string - Main log message
 *   - module: string - Module/source of the log
 *   - severity: string - Log severity (defaults to 'info' if undefined)
 *
 * Example:
 *   startNodeLogs({ app: 'api', message: 'Booting…', module: 'main', severity: 'info' });
 */
export function startNodeLogs(context: Omit<LogsNodeContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
	const normalizedContext = {
		...context,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: context.severity ?? 'info',
	};

	return startNodeLogs(normalizedContext);
}
