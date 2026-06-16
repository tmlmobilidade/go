import { type LoggerInfoInputContext, type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

export function info(
	message?: LoggerMessage,
	contextOrSpacesAfter?: LoggerInfoInputContext | number | string,
	spacesAfterOrBefore?: number,
	spacesBefore?: number,
): void {
	const context = typeof contextOrSpacesAfter === 'object' && contextOrSpacesAfter !== null ? contextOrSpacesAfter : undefined;
	const spacesAfter = typeof contextOrSpacesAfter === 'number' ? contextOrSpacesAfter : spacesAfterOrBefore;
	const normalizedSpacesBefore = typeof contextOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;

	if (normalizedSpacesBefore && normalizedSpacesBefore > 0) spacer(normalizedSpacesBefore);

	const formattedMessage = formatMessage(message, context?.message ?? '');

	console.log(`→ ${formattedMessage ?? ''}`);

	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
