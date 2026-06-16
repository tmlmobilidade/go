import { type LogsNodeContext } from '../interface/logs-node.js';

export function startNodeLogs(context: Omit<LogsNodeContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
	const normalizedContext = {
		...context,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: context.severity ?? 'info',
	};

	return startNodeLogs(normalizedContext);
}
