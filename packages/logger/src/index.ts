/* * */

import { GlobalIssue, type GlobalIssueContext, type GlobalIssueLevel } from './Issues/GlobalIssue.js';
import { LogsNextjs, LogsNextjsContext } from './logs/logs-nextjs.js';
import { LogsNode, type LogsNodeContext } from './logs/logs-node.js';

/* * */

export { initSentryNode } from './sentry/connection/sentry-node.js';

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
	message?: string
	silentConsole?: boolean
};
type LoggerInfoInputContext = Record<string, unknown> & {
	message?: string
};

/* * */

class LoggersClass {
	//

	/**
	 * Logs an info message to the console.
	 * @param context The context object containing the info message and context.
	 */
	logsNextjs(context: Omit<LogsNextjsContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }) {
		LogsNextjs({
			...context,
			app: context.app,
			message: context.message,
			module: context.module,
			severity: context.severity ?? 'info',
		});
	}

	logsNode(context: Omit<LogsNodeContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }) {
		LogsNode({
			...context,
			app: context.app,
			message: context.message,
			module: context.module,
			severity: context.severity ?? 'info',
		});
	}

	private getDefaultService() {
		return process.env.SERVICE_NAME ?? process.env.npm_package_name ?? 'unknown-service';
	}

	private formatMessage(message?: Error | LoggerMessage, fallback = '') {
		if (!message) return fallback;
		if (message instanceof Error) return message.message;
		if (Array.isArray(message)) return this.formatColumns(message);
		return message;
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
	 * Logs an error message in the console.
	 * @param message Error message to display.
	 * @param contextOrErrorOrSpacesAfter Optional error context, error object, or spacing.
	 * @param spacesAfter Optional number of blank lines to add after the message.
	 * @param spacesBefore Optional number of blank lines to add before the message.
	 */
	error(
		message?: Error | LoggerMessage,
		contextOrErrorOrSpacesAfter?: Error | LoggerErrorInputContext | number | string,
		spacesAfterOrBefore?: number,
		spacesBefore?: number,
	) {
		const context = typeof contextOrErrorOrSpacesAfter === 'object' && contextOrErrorOrSpacesAfter !== null && !(contextOrErrorOrSpacesAfter instanceof Error)
			? contextOrErrorOrSpacesAfter
			: undefined;
		const error = contextOrErrorOrSpacesAfter instanceof Error
			? contextOrErrorOrSpacesAfter
			: message instanceof Error
				? message
				: undefined;
		const spacesAfter = typeof contextOrErrorOrSpacesAfter === 'number' ? contextOrErrorOrSpacesAfter : spacesAfterOrBefore;
		const normalizedSpacesBefore = typeof contextOrErrorOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;
		if (normalizedSpacesBefore && normalizedSpacesBefore > 0) this.spacer(normalizedSpacesBefore);
		const formattedMessage = this.formatMessage(message, context?.message ?? error?.message ?? '');

		// Output error to the console unless explicitly silenced by the caller.
		if (!(contextOrErrorOrSpacesAfter as LoggerErrorInputContext | undefined)?.silentConsole) {
			console.error(`✘ ${formattedMessage}`, error ?? '');
		}

		// Add blank lines after, if requested
		if (spacesAfter && spacesAfter > 0) this.spacer(spacesAfter);
	}

	/**
	 * Sends a structured issue to Sentry with a selectable severity level.
	 * @param level The issue level to send.
	 * @param messageOrError The message or error to capture.
	 * @param context Optional metadata for Sentry.
	 */
	issue(level: GlobalIssueLevel, messageOrError: Error | string, context?: Omit<GlobalIssueContext, 'error' | 'level' | 'message'> & { service?: string }) {
		GlobalIssue({
			...context,
			error: messageOrError instanceof Error ? messageOrError : undefined,
			level,
			message: typeof messageOrError === 'string' ? messageOrError : messageOrError.message,
			service: context?.service ?? this.getDefaultService(),
		});
	}

	/**
	 * Logs an informational message to the console.
	 *
	 * @param message The message to display.
	 * @param contextOrSpacesAfter An optional context object (for Sentry) or number of blank lines after the message.
	 * @param spacesAfterOrBefore If previous param is context, this is blank lines after. If previous param is number, this is blank lines before.
	 * @param spacesBefore Blank lines before the message (used only if previous params are not numbers).
	 */
	info(
		message?: LoggerMessage,
		contextOrSpacesAfter?: LoggerInfoInputContext | number | string,
		spacesAfterOrBefore?: number,
		spacesBefore?: number,
	) {
		const context = typeof contextOrSpacesAfter === 'object' && contextOrSpacesAfter !== null ? contextOrSpacesAfter : undefined;
		const spacesAfter = typeof contextOrSpacesAfter === 'number' ? contextOrSpacesAfter : spacesAfterOrBefore;
		const normalizedSpacesBefore = typeof contextOrSpacesAfter === 'number' ? spacesAfterOrBefore : spacesBefore;

		// Add blank lines before, if requested
		if (normalizedSpacesBefore && normalizedSpacesBefore > 0) this.spacer(normalizedSpacesBefore);

		// Prepare the formatted message
		const formattedMessage = this.formatMessage(message, context?.message ?? '');

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
		const formattedMessage = this.formatMessage(message);
		console.log(`• ${formattedMessage}`);
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
		const formattedMessage = this.formatMessage(message);
		console.log(`✓ ${formattedMessage}`);
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

export { GlobalIssue };

/**
 * Logger error context interface.
 */
export type { GlobalIssueContext, GlobalIssueLevel };
