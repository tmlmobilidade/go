import { type ErrorArgs, type LoggerErrorContext, type LoggerInfoContext } from './types/message.js';

/**
 * Returns a logging context when the value is a plain context object.
 */
export function getContext(value: unknown): LoggerInfoContext | undefined {
	return typeof value === 'object' && value !== null && !(value instanceof Error)
		? value as LoggerInfoContext
		: undefined;
}

/**
 * Returns an error context when the value is a plain context object.
 */
export function getErrorContext(value: unknown): LoggerErrorContext | undefined {
	return getContext(value) as LoggerErrorContext | undefined;
}

/**
 * Finds the Error accepted by the backwards-compatible error signature.
 */
export function getError(args: ErrorArgs): Error | undefined {
	if (args.error instanceof Error) return args.error;
	if (args.contextOrErrorOrSpacesAfter instanceof Error) return args.contextOrErrorOrSpacesAfter;
	return args.message instanceof Error ? args.message : undefined;
}
