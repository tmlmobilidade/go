/* * */

import { formatMessage } from '@/logger/format-message.js';
import { spacer } from '@/logger/handlers/spacer.js';
import { getContext } from '@/logger/parse-arguments.js';
import { type InfoArgs } from '@/logger/types/message.js';

/**
 * Logs an informational message in the local console format.
 */
export function info(args: InfoArgs): void {
	const context = getContext(args.contextOrSpacesAfter);
	const spacesAfter = typeof args.contextOrSpacesAfter === 'number'
		? args.contextOrSpacesAfter
		: args.spacesAfterOrBefore;
	const spacesBefore = typeof args.contextOrSpacesAfter === 'number'
		? args.spacesAfterOrBefore
		: args.spacesBefore;

	if (spacesBefore && spacesBefore > 0) spacer(spacesBefore);
	console.log(`→ ${formatMessage(args.message, context?.message ?? '')}`);
	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
