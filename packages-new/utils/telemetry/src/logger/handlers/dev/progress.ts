import { formatMessage } from '../../format-message.js';
import { type ProgressArgs } from '../../types/message.js';
import { spacer } from './spacer.js';

/**
 * Logs a progress message in the local console format.
 */
export function progress(args: ProgressArgs): void {
	if (args.spacesBefore && args.spacesBefore > 0) spacer(args.spacesBefore);
	console.log(`• ${formatMessage(args.message)}`);
	if (args.spacesAfterOrBefore && args.spacesAfterOrBefore > 0) spacer(args.spacesAfterOrBefore);
}
