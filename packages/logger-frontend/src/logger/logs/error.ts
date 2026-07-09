/* * */

import { type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

/* * */

interface ErrorArgs {
	error?: unknown
	message?: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/**
 * Logs an error message and, when provided, the error object itself.
 */
export function error(args: Error | ErrorArgs): void {
	const parsedError = args instanceof Error ? args : args.error;
	const message = args instanceof Error ? undefined : args.message;
	const spacesBefore = args instanceof Error ? undefined : args.spacesBefore;
	const spacesAfter = args instanceof Error ? undefined : args.spacesAfterOrBefore;

	if (spacesBefore && spacesBefore > 0) spacer(spacesBefore);

	const errorMessage = parsedError instanceof Error ? parsedError.message : '';
	const formattedMessage = formatMessage(message, errorMessage);

	console.log(`✘ ${formattedMessage}`);
	if (parsedError) console.log(parsedError);

	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
