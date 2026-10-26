/* * */

import { cleanExpiredSessionsTask } from '@/tasks/clean-sessions.js';
import { cleanExpiredVerificationTokensTask } from '@/tasks/clean-verification-tokens.js';
import { sanitizePermissionsTask } from '@/tasks/sanitize-permissions.js';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { syncLabdbAgenciesTask } from './tasks/sync-labdb-agencies.js';

/* * */

async function main() {
	//

	// Only run in production environment
	if (process.env.ENVIRONMENT !== 'prd') {
		Logger.info({ message: 'Cleaner is disabled in non-prd environments' });
		return;
	}

	Logger.init();

	const globalTimer = new Timer();

	await cleanExpiredSessionsTask();
	await cleanExpiredVerificationTokensTask();
	await sanitizePermissionsTask();

	await syncLabdbAgenciesTask();

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
