import { type LogsNodeContext } from '../interface/logs-node.js';
import { error } from './error.js';
import { importInternalModule } from './import-internal-module.js';

export function startNodeLogs(context: Omit<LogsNodeContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
	const normalizedContext = {
		...context,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: context.severity ?? 'info',
	};

	void importInternalModule<typeof import('../interface/logs-node.js')>('../interface/logs-node.js')
		.then(module => module.startNodeLogs(normalizedContext))
		.catch(caughtError => error('Failed to start Node logs', caughtError));
}
