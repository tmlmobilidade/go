import { formatMessage } from '../../format-message.js';
import { getError, getErrorContext } from '../../parse-arguments.js';
import { type ErrorArgs } from '../../types/message.js';
import { spacer } from '../spacer.js';

/**
 * Logs an error and stack trace in the local console format.
 */
export function error(args: ErrorArgs): void {
	writeError(args, '✘');
}

/**
 * Logs a fatal error and stack trace in the local console format.
 */
export function fatal(args: ErrorArgs): void {
	writeError(args, '‼');
}

function writeError(args: ErrorArgs, prefix: string): void {
	const context = getErrorContext(args.contextOrErrorOrSpacesAfter);
	const parsedError = getError(args);
	const spacesAfter = typeof args.contextOrErrorOrSpacesAfter === 'number'
		? args.contextOrErrorOrSpacesAfter
		: args.spacesAfterOrBefore;
	const spacesBefore = typeof args.contextOrErrorOrSpacesAfter === 'number'
		? args.spacesAfterOrBefore
		: args.spacesBefore;

	if (spacesBefore && spacesBefore > 0) spacer(spacesBefore);
	if (!context?.silentConsole) {
		console.error(`${prefix} ${formatMessage(args.message, context?.message ?? parsedError?.message ?? '')}`);
		console.error(parsedError?.stack ?? new Error().stack);
	}
	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
