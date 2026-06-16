/* * */

import { type GlobalIssueContext, type GlobalIssueLevel, type LogsNextjsContext, type LogsNodeContext } from './interface/index.js';
import { divider, error, info, init, issue, progress, spacer, startLogsNextjs, startNodeLogs, success, terminate, title } from './logs/index.js';
import { type LoggerErrorInputContext, type LoggerInfoInputContext, type LoggerMessage } from './types/types.js';

/* * */

class LoggerClass {
	//

	divider(message?: string, size?: number): void {
		divider(message, size);
	}

	error(message?: Error | LoggerMessage, contextOrErrorOrSpacesAfter?: Error | LoggerErrorInputContext | number | string, spacesAfterOrBefore?: number, spacesBefore?: number): void {
		error(message, contextOrErrorOrSpacesAfter, spacesAfterOrBefore, spacesBefore);
	}

	info(message?: LoggerMessage, contextOrSpacesAfter?: LoggerInfoInputContext | number | string, spacesAfterOrBefore?: number, spacesBefore?: number): void {
		info(message, contextOrSpacesAfter, spacesAfterOrBefore, spacesBefore);
	}

	init(): void {
		init();
	}

	issue(level: GlobalIssueLevel, messageOrError: Error | string, context?: Omit<GlobalIssueContext, 'error' | 'level' | 'message'> & { service?: string }): void {
		issue(level, messageOrError, context);
	}

	progress(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
		progress(message, spacesAfter, spacesBefore);
	}

	spacer(lines?: number): void {
		spacer(lines);
	}

	startLogsNextjs(context: Omit<LogsNextjsContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
		startLogsNextjs(context);
	}

	startNodeLogs(context: Omit<LogsNodeContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
		startNodeLogs(context);
	}

	success(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
		success(message, spacesAfter, spacesBefore);
	}

	terminate(message: string): void {
		terminate(message);
	}

	title(message: string): void {
		title(message);
	}

	//
}

/* * */

export const Logger = new LoggerClass();
