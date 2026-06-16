import { type LogsNextjsContext } from '../interface/logs-nextjs.js';

export function startLogsNextjs(context: Omit<LogsNextjsContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
	const normalizedContext = {
		...context,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: context.severity ?? 'info',
	};

	return startLogsNextjs(normalizedContext);
}
