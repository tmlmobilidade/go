/* * */

import { type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

/* * */

/**
 * Logs a success indicator message in a standardized, padded format.
 *
 * This helper prints a green checkmark (✓) followed by the provided message to stdout,
 * with optional leading and trailing blank lines for readability.
 *
 * - `message`: The main message content to display (supports columns/array via LoggerMessage).
 * - `spacesBefore`: (optional) Number of blank lines to insert before the message.
 * - `spacesAfter`: (optional) Number of blank lines to insert after the message.
 *
 * Usage:
 *   success('Operation completed!');
 *   success(['Deployment', 'OK'], 0, 2);
 *   success('User created', 1);
 *
 * @param message LoggerMessage — string or columns to display after checkmark
 * @param spacesAfter number (optional) — blank lines after the message
 * @param spacesBefore number (optional) — blank lines before the message
 */
export function success(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
	if (spacesBefore && spacesBefore > 0) spacer(spacesBefore);
	const formattedMessage = formatMessage(message);
	console.log(`✓ ${formattedMessage}`);
	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
