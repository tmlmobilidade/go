/* * */

import { globalIssue, type GlobalIssueContext, type GlobalIssueLevel } from '../interface/globalIssue.js';
import { getDefaultService } from './get-default-service.js';

/* * */

interface IssueArgs {
	context?: Omit<GlobalIssueContext, 'error' | 'level' | 'message'> & { service?: string }
	level: GlobalIssueLevel
	messageOrError: Error | string
}

/**
 * Reports an issue with a specific severity level, message/error, and optional context.
 *
 * This helper constructs and passes a normalized GlobalIssueContext object to the globalIssue handler.
 * - `level`: The severity of the issue (see GlobalIssueLevel).
 * - `messageOrError`: The message string or Error object describing the issue.
 * - `context`: Additional context fields; allows overriding `service` (else uses default).
 *
 * If an Error is provided, its `message` is used for the `message` property and the error is passed as well.
 * If a string is provided, it becomes the `message` and `error` is omitted.
 *
 * @param level The severity of the issue.
 * @param messageOrError The issue message or Error object.
 * @param context Additional context (excluding 'error', 'level', and 'message'); `service` is overrideable.
 */
export function issue(args: IssueArgs): void {
	globalIssue({
		...args.context,
		error: args.messageOrError instanceof Error ? args.messageOrError : undefined,
		level: args.level,
		message: typeof args.messageOrError === 'string' ? args.messageOrError : args.messageOrError.message,
		service: args.context?.service ?? getDefaultService(),
	});
}
