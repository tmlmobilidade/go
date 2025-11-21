/* * */

import { cleanExpiredSessions } from '@/tasks/clean-sessions.js';
import { cleanExpiredVerificationTokens } from '@/tasks/clean-verification-tokens.js';
import { sanitizePermissions } from '@/tasks/sanitize-permissions.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const RUN_INTERVAL = 300_000; // 5 minutes in milliseconds

/* * */

(async function init() {
	const runOnInterval = async () => {
		Logger.init();

		const globalTimer = new Timer();

		await cleanExpiredSessions();
		await cleanExpiredVerificationTokens();
		await sanitizePermissions();

		Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
