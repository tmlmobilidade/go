/* * */

import { type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

/* * */

interface InfoArgs {
	message: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/**
 * Logs an informational message.
 */
export function info(args: InfoArgs): void {
	if (args.spacesBefore && args.spacesBefore > 0) spacer(args.spacesBefore);

	const formattedMessage = formatMessage(args.message);
	console.log(`→ ${formattedMessage}`);

	if (args.spacesAfterOrBefore && args.spacesAfterOrBefore > 0) spacer(args.spacesAfterOrBefore);
}
