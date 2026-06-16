import { type LoggerMessage } from '../types/types.js';
import { formatColumns } from './format-columns.js';

export function formatMessage(message?: Error | LoggerMessage, fallback = ''): string {
	if (!message) return fallback;
	if (message instanceof Error) return message.message;
	if (Array.isArray(message)) return formatColumns(message);
	return message;
}
