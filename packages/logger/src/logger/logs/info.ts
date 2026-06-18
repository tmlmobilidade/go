/* * */

import { type LoggerInfoInputContext, type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

/* * */

interface InfoArgs {
	contextOrSpacesAfter?: LoggerInfoInputContext | number | string
	message?: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/**
 * Logs an informational message in a normalized, padded format.
 *
 * This helper prints a formatted message to stdout (with a "→" prefix),
 * with optional leading and trailing line spacing.
 *
 * - `contextOrSpacesAfter` can accept a LoggerInfoInputContext object,
 *   or a number for trailing line breaks, or a string for legacy compatibility.
 * - `spacesAfterOrBefore`/`spacesBefore` allow fine-grained control over spacing,
 *   depending on which is provided (for backward compatibility with older signature).
 *
 * @param args
 *   - contextOrSpacesAfter: LoggerInfoInputContext | number | string (context object or trailing space count)
 *   - message: LoggerMessage (the info message content, array of columns or string)
 *   - spacesAfterOrBefore: (optional) number, used as line breaks after if contextOrSpacesAfter is a context
 *   - spacesBefore: (optional) number, line breaks before logging (if contextOrSpacesAfter is not number)
 *
 * Examples:
 *   info({ message: 'Starting tasks' }
 *   info({ contextOrSpacesAfter: 2, message: 'Deploying', spacesBefore: 1 })
 *   info({ contextOrSpacesAfter: { message: 'Test', ... }, message: [] })
 */
export function info(args: InfoArgs): void {
	const context = typeof args.contextOrSpacesAfter === 'object' && args.contextOrSpacesAfter !== null ? args.contextOrSpacesAfter : undefined;
	const spacesAfter = typeof args.contextOrSpacesAfter === 'number' ? args.contextOrSpacesAfter : args.spacesAfterOrBefore;
	const normalizedSpacesBefore = typeof args.contextOrSpacesAfter === 'number' ? args.spacesAfterOrBefore : args.spacesBefore;

	if (normalizedSpacesBefore && normalizedSpacesBefore > 0) spacer(normalizedSpacesBefore);

	const formattedMessage = formatMessage(args.message, context?.message ?? '');

	console.log(`→ ${formattedMessage ?? ''}`);

	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
