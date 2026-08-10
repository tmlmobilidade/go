/* * */

import { type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

/* * */

interface ProgressArgs {
	message: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/**
 * Logs a progress indicator message in a standardized, padded format.
 *
 * This helper prints a bullet-point message to stdout (with a "•" prefix)
 * with optional leading and trailing line spacing for visual separation.
 *
 * - `message`: The main message content to display (supports columns/array).
 * - `spacesBefore`: (optional) Number of blank lines to insert before the message.
 * - `spacesAfterOrBefore`: (optional) Number of blank lines to insert after the message.
 *
 * Usage:
 *   progress({ message: 'Processing…' });
 *   progress({ message: ['Step', 'Done'], spacesBefore: 1 });
 *   progress({ message: 'Uploading', spacesAfterOrBefore: 2 });
 *
 * @param args
 *   - message: LoggerMessage (required) — string or columns to display after bullet
 *   - spacesBefore: number (optional) — lines before
 *   - spacesAfterOrBefore: number (optional) — lines after
 */
export function progress(args: ProgressArgs): void {
	if (args.spacesBefore && args.spacesBefore > 0) spacer(args.spacesBefore);
	const formattedMessage = formatMessage(args.message);
	console.log(`• ${formattedMessage}`);
	if (args.spacesAfterOrBefore && args.spacesAfterOrBefore > 0) spacer(args.spacesAfterOrBefore);
}
