import { type LogsNextjsContext } from '../interface/logs-nextjs.js';
import { error } from './error.js';
import { importInternalModule } from './import-internal-module.js';

export function startLogsNextjs(context: Omit<LogsNextjsContext, 'app' | 'message' | 'module' | 'severity'> & { app: string, message: string, module: string, severity: string }): void {
	const normalizedContext = {
		...context,
		app: context.app,
		message: context.message,
		module: context.module,
		severity: context.severity ?? 'info',
	};

	void importInternalModule<typeof import('../interface/logs-nextjs.js')>('../interface/logs-nextjs.js')
		.then(module => module.startLogsNextjs(normalizedContext))
		.catch(caughtError => error('Failed to start Next.js logs', caughtError));
}
