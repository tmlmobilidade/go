/**
 * Provides a context type for logging in Next.js environments.
 *
 * @interface LogsNextjsContext
 * @property {string} [app]      - Optional name of the application generating the log.
 * @property {string} message    - Log message to record.
 * @property {string} [module]   - Optional name of the module related to the log event.
 * @property {string} [severity] - Optional severity level of the log (e.g., info, warning, error).
 * @property {unknown} [key: string] - Extendable for any additional context information.
 */
export interface LogsNextjsContext {
	[key: string]: unknown
	app?: string
	message: string
	module?: string
	severity?: string
}

/**
 * Logs a message using Sentry's logger in a Next.js environment.
 *
 * @param {LogsNextjsContext} context - Contextual information about the log event.
 * @returns {void}
 */
import { logger } from '@sentry/node';

export const LogsNextjs = (context: LogsNextjsContext): void => {
	const { app, message, module, severity } = context;
	logger.info(message, {
		...context,
		app,
		message,
		module,
		severity,
	});
};
