/* * */

import { type LoggerErrorInputContext, type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

/* * */

interface ErrorArgs {
	contextOrErrorOrSpacesAfter?: LoggerErrorInputContext | number | string
	error?: Error
	message?: LoggerMessage
	spacesAfterOrBefore?: number
	spacesBefore?: number
}

/**
 * Logs an error message to the console, with flexible arguments and formatting.
 *
 * @param message The error or message to log. Can be an Error object or a LoggerMessage.
 * @param contextOrErrorOrSpacesAfter Optional. Can be one of:
 *   - Error: Use as the error instance.
 *   - LoggerErrorInputContext: Pass additional context (optionally with silentConsole).
 *   - number: Number of spaces after the log line.
 *   - string: Additional message context.
 * @param spacesAfterOrBefore Optional. Number of spaces after or before depending on previous arg.
 * @param spacesBefore Optional. Number of blank lines before the log.
 */
export function error(args: ErrorArgs): void {
	//

	let context: LoggerErrorInputContext | undefined;
	let parsedError: Error | undefined;
	let spacesAfter: number | undefined;
	let normalizedSpacesBefore: number | undefined;

	// Determine context and error instance based on argument types
	if (typeof args.contextOrErrorOrSpacesAfter === 'object' && args.contextOrErrorOrSpacesAfter !== null && !(args.contextOrErrorOrSpacesAfter instanceof Error)) {
		context = args.contextOrErrorOrSpacesAfter as LoggerErrorInputContext;
	} else {
		context = undefined;
	}

	if (args.contextOrErrorOrSpacesAfter instanceof Error) {
		parsedError = args.contextOrErrorOrSpacesAfter;
	} else if (args.message instanceof Error) {
		parsedError = args.message;
	} else {
		parsedError = undefined;
	}

	if (typeof args.contextOrErrorOrSpacesAfter === 'number') {
		spacesAfter = args.contextOrErrorOrSpacesAfter;
		normalizedSpacesBefore = args.spacesAfterOrBefore;
	} else {
		spacesAfter = args.spacesAfterOrBefore;
		normalizedSpacesBefore = args.spacesBefore;
	}

	if (normalizedSpacesBefore && normalizedSpacesBefore > 0) {
		spacer(normalizedSpacesBefore);
	}

	const formattedMessage = formatMessage(
		args.message,
		context?.message ?? parsedError?.message ?? '',
	);

	// Only log if not silent
	if (!context?.silentConsole) {
		console.error(`✘ ${formattedMessage}`, parsedError ?? '');
	}

	if (spacesAfter && spacesAfter > 0) {
		spacer(spacesAfter);
	}
}
