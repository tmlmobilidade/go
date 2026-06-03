/**
 * Provides a context type for logging in Node.js environments.
 *
 * @interface LogsNodeContext
 * @property {string} [app]      - Optional name of the application generating the log.
 * @property {string} message    - Log message to record.
 * @property {string} [module]   - Optional name of the module related to the log event.
 * @property {string} [severity] - Optional severity level of the log (e.g., info, warning, error).
 * @property {unknown} [key: string] - Extendable for any additional context information.
 */
import { logger } from '@sentry/node';

export interface LogsNodeContext {
	[key: string]: unknown
	app?: string
	message: string
	module?: string
	severity?: string
}

/**
 * Logs a message using Sentry's logger in a Node.js environment.
 *
 * @param {LogsNodeContext} context - Contextual information about the log event.
 * @returns {void}
 */
export const LogsNode = (context: LogsNodeContext): void => {
	const { app, message, module, severity } = context;
	logger.info(message, {
		...context,
		app,
		message,
		module,
		severity,
	});
};
