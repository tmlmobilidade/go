import { formatMessage } from '../../format-message.js';
import { type LoggerMessage } from '../../types/message.js';
import { spacer } from '../spacer.js';

/**
 * Logs a debug message in the local console format.
 */
export function debug(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
	writeMessage(console.debug, '·', message, spacesAfter, spacesBefore);
}

/**
 * Logs a successful operation in the local console format.
 */
export function success(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
	writeMessage(console.log, '✓', message, spacesAfter, spacesBefore);
}

/**
 * Logs a warning in the local console format.
 */
export function warning(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
	writeMessage(console.warn, '⚠', message, spacesAfter, spacesBefore);
}

function writeMessage(
	write: (message?: unknown) => void,
	prefix: string,
	message: LoggerMessage,
	spacesAfter?: number,
	spacesBefore?: number,
): void {
	if (spacesBefore && spacesBefore > 0) spacer(spacesBefore);
	write(`${prefix} ${formatMessage(message)}`);
	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
