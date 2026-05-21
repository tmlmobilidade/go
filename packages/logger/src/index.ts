/* * */

import { ErrorIssue, type ErrorIssueContext } from './Issues/ErrorIssue.js';
import { InfoIssue, type InfoIssueContext } from './Issues/InfoIssue.js';
import { LoggerError } from './logger/loggerError.js';
import { LoggerInfo } from './logger/loggerInfo.js';

/* * */
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
type LoggerErrorInputContext = Record<string, unknown> & {
	error?: Error
	message?: string
	service?: string
	silentConsole?: boolean
};
type LoggerInfoInputContext = Record<string, unknown> & {
	message?: string
	service?: string
};

/* * */

class LoggersClass {
	//

	/**
	 * Logs an error message to the console and sends error details to Sentry if context is provided.
	 * @param context The context object containing the error message and context.
	 */
	logError(context: LoggerErrorInputContext) {
		LoggerError({
			...context,
			message: context.message ?? 'Unknown error',
			service: context.service ?? this.getDefaultService(),
		});
	}

	/**
	 * Logs an info message to the console and sends info details to Sentry if context is provided.
	 * @param context The context object containing the info message and context.
	 */
	logInfo(context: LoggerInfoInputContext) {
		LoggerInfo({
			...context,
			message: context.message ?? 'Unknown info',
			service: context.service ?? this.getDefaultService(),
		});
	}

	/**
	 * Emits all logger methods once for testing.
	 * @param service Service name used for Sentry tagging.
	 */
	showAll(service: string) {
		const feature = 'logger-test';
		this.info('Logger.info test', { feature, message: 'Logger.info test', service });
		this.logInfo({ feature, message: 'Logger.logInfo test', service });
	}

	private getDefaultService() {
		return process.env.SERVICE_NAME ?? process.env.npm_package_name ?? 'unknown-service';
	}

	private isErrorIssueContext(value: unknown): value is LoggerErrorInputContext {
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
		contextOrErrorOrSpacesAfter?: Error | LoggerErrorInputContext | number,
		spacesAfterOrBefore?: number,
		spacesBefore?: number,
	) {
		// Logs an error message to the console and sends error details to Sentry if context is provided.
		const context = this.isErrorIssueContext(contextOrErrorOrSpacesAfter) ? contextOrErrorOrSpacesAfter : undefined;
		const error = contextOrErrorOrSpacesAfter instanceof Error
			? contextOrErrorOrSpacesAfter
			: message instanceof Error
				? message
				: undefined;
		const spacesAfter = typeof contextOrErrorOrSpacesAfter === 'number' ? contextOrErrorOrSpacesAfter : spacesAfterOrBefore;
		const normalizedSpacesBefore = typeof contextOrErrorOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;
		if (normalizedSpacesBefore && normalizedSpacesBefore > 0) this.spacer(normalizedSpacesBefore);
		const formattedMessage = message
			? message instanceof Error
				? message.message
				: Array.isArray(message)
					? this.formatColumns(message)
					: message
			: context?.message ?? '';

		// If there is context but no error object, create an error to capture the right stack
		const errorFromCaller = !error && context
			? (() => {
				const contextMessage = typeof context.message === 'string' ? context.message : formattedMessage;
				const callerError = new Error(contextMessage);
				// Sets error stack trace to the callsite
				if (typeof Error.captureStackTrace === 'function') Error.captureStackTrace(callerError, this.error);
				return callerError;
			})()
			: undefined;

		// If context exists, send the error to Sentry (LoggerError)
		if (context) {
			const contextMessage = typeof context.message === 'string' ? context.message : formattedMessage;
			ErrorIssue({
				...context,
				error: error ?? context.error ?? errorFromCaller,
				message: contextMessage,
				service: context.service ?? this.getDefaultService(),
			});
		}

		// Output error to the console unless explicitly silenced by the caller.
		if (!context?.silentConsole) {
			console.error(`✘ ${formattedMessage}`, error ?? '');
		}

		// Add blank lines after, if requested
		if (spacesAfter && spacesAfter > 0) this.spacer(spacesAfter);
	}

	/**
	 * Logs an informational message to the console, and to Sentry if context is given.
	 *
	 * @param message The message to display.
	 * @param contextOrSpacesAfter An optional context object (for Sentry) or number of blank lines after the message.
	 * @param spacesAfterOrBefore If previous param is context, this is blank lines after. If previous param is number, this is blank lines before.
	 * @param spacesBefore Blank lines before the message (used only if previous params are not numbers).
	 */
	info(
		message?: LoggerMessage,
		contextOrSpacesAfter?: LoggerInfoInputContext | number,
		spacesAfterOrBefore?: number,
		spacesBefore?: number,
	) {
		// Logs an informational message to the console and sends information to Sentry if context is provided.
		const context = typeof contextOrSpacesAfter === 'object' && contextOrSpacesAfter !== null ? contextOrSpacesAfter : undefined;
		const spacesAfter = typeof contextOrSpacesAfter === 'number' ? contextOrSpacesAfter : spacesAfterOrBefore;
		const normalizedSpacesBefore = typeof contextOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;

		// Add blank lines before, if requested
		if (normalizedSpacesBefore && normalizedSpacesBefore > 0) this.spacer(normalizedSpacesBefore);

		// Prepare the formatted message
		const formattedMessage = message
			? message instanceof Error
				? message.message
				: Array.isArray(message)
					? this.formatColumns(message)
					: message
			: context?.message ?? '';

		// If context exists, send the information to Sentry (LoggerInfo)
		if (context) {
			const contextMessage = typeof context.message === 'string' ? context.message : formattedMessage;
			InfoIssue({
				...context,
				message: contextMessage,
				service: context.service ?? this.getDefaultService(),
			});
		}

		// Output information to the console
		console.log(`→ ${formattedMessage ?? ''}`);

		// Add blank lines after, if requested
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
export type { ErrorIssueContext };

/**
 * Logger info context interface.
 */
export type { InfoIssueContext };
