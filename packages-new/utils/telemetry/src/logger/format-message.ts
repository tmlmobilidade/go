import { type LoggerColumn, type LoggerMessage } from './types/message.js';

function formatColumns(columns: (LoggerColumn | string)[]): string {
	return columns
		.map((item) => {
			if (typeof item === 'string') return item;
			if (!item.c) return String(item.t);
			return item.a === 'right' ? String(item.t).padStart(item.c) : String(item.t).padEnd(item.c);
		})
		.join('');
}

/**
 * Converts a supported logger message into displayable text.
 */
export function formatMessage(message?: LoggerMessage, fallback = ''): string {
	if (!message) return fallback;
	if (message instanceof Error) return message.message;
	if (Array.isArray(message)) return formatColumns(message);
	return message;
}
