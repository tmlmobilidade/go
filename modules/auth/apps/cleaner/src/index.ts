/* * */

import { cleanExpiredSessions } from '@/tasks/clean-sessions.js';
import { cleanExpiredVerificationTokens } from '@/tasks/clean-verification-tokens.js';
import { sanitizePermissions } from '@/tasks/sanitize-permissions.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.logsNode({ app: 'cleaner', message: 'Sentry Auth Cleaner initialized', module: 'home', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Auth Cleaner', error);
	}

	// Only run in production environment
	if (process.env.ENVIRONMENT !== 'prd') {
		Logger.info('Cleaner is disabled in non-prd environments');
		return;
	}

	Logger.init();

	const globalTimer = new Timer();

	await cleanExpiredSessions();
	await cleanExpiredVerificationTokens();
	await sanitizePermissions();

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
