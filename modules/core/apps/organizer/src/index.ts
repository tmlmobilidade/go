/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { cleanExpiredSessions } from './tasks/clean-sessions.js';
import { cleanExpiredVerificationTokens } from './tasks/clean-verification-tokens.js';
import { sanitizePermissions } from './tasks/sanitize-permissions.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'organizer', message: 'Sentry Organizer initialized', module: 'core', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Organizer' });
}

async function main() {
	//

	//
	// Only run in production environment

	if (process.env.ENVIRONMENT !== 'prd') {
		Logger.info({ message: 'Organizer is disabled in non-prd environments' });
		return;
	}

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run the cleanup tasks

	await cleanExpiredSessions();
	await cleanExpiredVerificationTokens();
	await sanitizePermissions();

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
