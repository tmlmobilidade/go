/* * */

import { cleanExpiredSessions } from '@/clean-sessions.js';
import { cleanExpiredVerificationTokens } from '@/clean-verification-tokens.js';
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

		Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
