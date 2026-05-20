/* * */

import { type LogErrorContext, LoggerError } from './Logger/LoggerError/index.js';
import { LoggerInfo, type LogInfoContext } from './Logger/LoggerInfo/index.js';

interface LoggerColumn {

	/**
	 * Column alignment.
	 */
	a?: 'left' | 'right'

	/**
	 * Column width.
	 */
	c?: number

	/**
	 * Column text.
	 */
	t: number | string

}

type LoggerMessage = (LoggerColumn | string)[] | string;

/* * */

class LoggersClass {
	//

	private isLogErrorContext(value: unknown): value is LogErrorContext {
		return typeof value === 'object' && value !== null && !(value instanceof Error);
	}

	/**
	 * Loggers a divider line in the console.
	 * @param message Optional message to display.
	 * @param size Width of the divider line. Default is `75`.
	 */
	divider(message?: string, size = 75) {
		console.log();
		if (message) console.log(`- ${message} ${'-'.repeat(size - 2 - message.length < 1 ? 1 : size - 2 - message.length)}`);
		else console.log('-'.repeat(size));
		console.log();
	}

	/**
	 * Loggers an error message in the console.
	 * @param message Error message to display.
	 * @param contextOrErrorOrSpacesAfter Optional error context, error object, or spacing.
	 * @param spacesAfter Optional number of blank lines to add after the message.
	 * @param spacesBefore Optional number of blank lines to add before the message.
	 */
	error(
		message?: Error | LoggerMessage,
		contextOrErrorOrSpacesAfter?: Error | LogErrorContext | number,
		spacesAfterOrBefore?: number,
		spacesBefore?: number,
	) {
		const context = this.isLogErrorContext(contextOrErrorOrSpacesAfter) ? contextOrErrorOrSpacesAfter : undefined;
		const error = contextOrErrorOrSpacesAfter instanceof Error ? contextOrErrorOrSpacesAfter : message instanceof Error ? message : undefined;
		const spacesAfter = typeof contextOrErrorOrSpacesAfter === 'number' ? contextOrErrorOrSpacesAfter : spacesAfterOrBefore;
		const normalizedSpacesBefore = typeof contextOrErrorOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;
		if (normalizedSpacesBefore && normalizedSpacesBefore > 0) this.spacer(normalizedSpacesBefore);
		const formattedMessage = message
			? message instanceof Error
				? message.message
				: Array.isArray(message) ? this.formatColumns(message) : message
			: context?.message ?? '';
		const errorFromCaller = !error && context
			? (() => {
				const callerError = new Error(context.message ?? formattedMessage);
				// Keep Sentry's top frame at the logger callsite (e.g., controller), not inside Logger.error.
				if (typeof Error.captureStackTrace === 'function') Error.captureStackTrace(callerError, this.error);
				return callerError;
			})()
			: undefined;
		if (context) {
			LoggerError({
				...context,
				error: error ?? context.error ?? errorFromCaller,
				message: context.message ?? formattedMessage,
			});
		}
		console.error(`✘ ${formattedMessage}`, error ?? '');
		if (spacesAfter && spacesAfter > 0) this.spacer(spacesAfter);
	}

	/**
	 * Loggers an informational message in the console.
	 * @param message Informational message to display.
	 * @param spacesAfter Optional number of blank lines to add after the message.
	 * @param spacesBefore Optional number of blank lines to add before the message.
	 */
	info(message?: LoggerMessage, contextOrSpacesAfter?: LogInfoContext | number, spacesAfterOrBefore?: number, spacesBefore?: number) {
		const context = typeof contextOrSpacesAfter === 'object' && contextOrSpacesAfter !== null ? contextOrSpacesAfter : undefined;
		const spacesAfter = typeof contextOrSpacesAfter === 'number' ? contextOrSpacesAfter : spacesAfterOrBefore;
		const normalizedSpacesBefore = typeof contextOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;
		if (normalizedSpacesBefore && normalizedSpacesBefore > 0) this.spacer(normalizedSpacesBefore);
		const formattedMessage = message
			? Array.isArray(message) ? this.formatColumns(message) : message
			: context?.message ?? '';
		if (context) {
			LoggerInfo({
				...context,
				message: context.message ?? formattedMessage,
			});
		}
		console.log(`→ ${formattedMessage ?? ''}`);
		if (spacesAfter && spacesAfter > 0) this.spacer(spacesAfter);
	}

	/**
	 * Initial message for program startup.
	 */
	init() {
		const currentDate = new Date().toISOString();
		console.log();
		console.log('-'.repeat(currentDate.length));
		console.log(currentDate);
		console.log('-'.repeat(currentDate.length));
		console.log();
	}

	/**
	 * Loggers a progress message in the console.
	 * @param message Progress message to display.
	 * @param spacesAfter Optional number of blank lines to add after the message.
	 * @param spacesBefore Optional number of blank lines to add before the message.
	 */
	progress(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number) {
		if (spacesBefore && spacesBefore > 0) this.spacer(spacesBefore);
		if (Array.isArray(message)) console.log(`• ${this.formatColumns(message)}`);
		else console.log(`• ${message}`);
		if (spacesAfter && spacesAfter > 0) this.spacer(spacesAfter);
	}

	/**
	 * Loggers a spacer line in the console.
	 * @param lines Number of blank lines to add. Default is `1`.
	 */
	spacer(lines = 1) {
		for (let i = 0; i < lines; i++) {
			console.log();
		}
	}

	/**
	 * Loggers a success message in the console.
	 * @param message Success message to display.
	 * @param spacesAfter Optional number of blank lines to add after the message.
	 * @param spacesBefore Optional number of blank lines to add before the message.
	 */
	success(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number) {
		if (spacesBefore && spacesBefore > 0) this.spacer(spacesBefore);
		if (Array.isArray(message)) console.log(`✓ ${this.formatColumns(message)}`);
		else console.log(`✓ ${message}`);
		if (spacesAfter && spacesAfter > 0) this.spacer(spacesAfter);
	}

	/**
	 * Loggers a termination message in the console.
	 * @param message Termination message to display.
	 */
	terminate(message: string) {
		console.log();
		console.log('-'.repeat(message.length));
		console.log(message);
		console.log('-'.repeat(message.length));
		console.log();
	}

	/**
	 * Loggers a title message in the console.
	 * @param message Title message to display.
	 */
	title(message: string) {
		console.log();
		console.log(`▶︎ ${message}`);
		console.log();
	}

	/**
	 * Formats an array of log columns or strings into a single string.
	 * @param columns Array of log columns or strings to format.
	 * @returns Formatted string.
	 */
	private formatColumns(columns: (LoggerColumn | string)[]): string {
		return columns
			.map((item) => {
				if (typeof item === 'string') return item;
				if (!item.c) return String(item.t);
				if (item.a === 'right') return String(item.t).padStart(item.c);
				return String(item.t).padEnd(item.c);
			})
			.join('');
	}

	//
}

/**
 * Logger class for structured logging.
 */
export const Logger = new LoggersClass();

/**
 * Logger error context interface.
 */
export type { LogErrorContext };

/**
 * Logger info context interface.
 */
export type { LogInfoContext };
