import { type LoggerErrorInputContext, type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

export function error(
	message?: Error | LoggerMessage,
	contextOrErrorOrSpacesAfter?: Error | LoggerErrorInputContext | number | string,
	spacesAfterOrBefore?: number,
	spacesBefore?: number,
): void {
	const context = typeof contextOrErrorOrSpacesAfter === 'object' && contextOrErrorOrSpacesAfter !== null && !(contextOrErrorOrSpacesAfter instanceof Error)
		? contextOrErrorOrSpacesAfter
		: undefined;
	const parsedError = contextOrErrorOrSpacesAfter instanceof Error
		? contextOrErrorOrSpacesAfter
		: message instanceof Error
			? message
			: undefined;
	const spacesAfter = typeof contextOrErrorOrSpacesAfter === 'number' ? contextOrErrorOrSpacesAfter : spacesAfterOrBefore;
	const normalizedSpacesBefore = typeof contextOrErrorOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;
	if (normalizedSpacesBefore && normalizedSpacesBefore > 0) spacer(normalizedSpacesBefore);
	const formattedMessage = formatMessage(message, context?.message ?? parsedError?.message ?? '');

	if (!(contextOrErrorOrSpacesAfter as LoggerErrorInputContext | undefined)?.silentConsole) {
		console.error(`✘ ${formattedMessage}`, parsedError ?? '');
	}

	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
