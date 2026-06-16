import { globalIssue, type GlobalIssueContext, type GlobalIssueLevel } from '../interface/globalIssue.js';
import { getDefaultService } from './get-default-service.js';

export function issue(level: GlobalIssueLevel, messageOrError: Error | string, context?: Omit<GlobalIssueContext, 'error' | 'level' | 'message'> & { service?: string }): void {
	globalIssue({
		...context,
		error: messageOrError instanceof Error ? messageOrError : undefined,
		level,
		message: typeof messageOrError === 'string' ? messageOrError : messageOrError.message,
		service: context?.service ?? getDefaultService(),
	});
}
