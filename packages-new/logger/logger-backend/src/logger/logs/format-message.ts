/* * */

import { type LoggerMessage } from '../types/types.js';
import { formatColumns } from './format-columns.js';

/* * */

/**
 * Formats a logger message or error into a displayable string.
 *
 * Handles:
 *  - undefined/null: returns `fallback`.
 *  - Error instance: returns error's message.
 *  - LoggerMessage array: formats columns for tabular output.
 *  - String: returns the string as-is.
 *
 * @param message The message, error, or array to format.
 * @param fallback String to return when message is undefined.
 * @returns Formatted string for output.
 */
export function formatMessage(message?: Error | LoggerMessage, fallback = ''): string {
	if (!message) return fallback;
	if (message instanceof Error) return message.message;
	if (Array.isArray(message)) return formatColumns(message);
	return message;
}
