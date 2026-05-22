/**
 * LoggerInfo utility for logging informational events to Sentry.
 *
 * Records a structured informational log to Sentry, supporting optional module, tag, and severity fields,
 * along with any additional metadata. Intended for use in Node.js/TypeScript applications where
 * context-rich info should be reported to Sentry.
 *
 * @module Logs
 */

import { logger } from '@sentry/core';

/**
 * Context object for structured informational logging.
 *
 * @property {string} message    - The informational message to log. (required)
 * @property {string} [module]   - The module or subsystem associated with this log entry.
 * @property {string} [tag]      - Additional tag for categorization or filtering.
 * @property {string} [severity] - Informational severity level (e.g., "info", "warning", "error").
 * @property {object} [key: string] - Any additional metadata fields for richer logging context.
 */
export interface LogsContext {
	[key: string]: unknown
	message: string
	module?: string
	severity?: string
	tag?: string
}

/**
 * Logs a structured informational message with context to Sentry.
 * Any extra fields on the context object are sent as metadata.
 *
 * @param {LogsContext} context - The log context object (requires `message`)
 *
 * @example
 * Logs({
 *   message: 'Created alert successfully',
 *   module: 'alerts',
 *   severity: 'info',
 *   app: 'API',
 *   alertId: 123
 * });
 */
export const Logs = (context: LogsContext): void => {
	const { app, message, module, severity } = context;
	logger.info(message, {
		...context,
		app,
		message,
		module,
		severity,
	});
};
