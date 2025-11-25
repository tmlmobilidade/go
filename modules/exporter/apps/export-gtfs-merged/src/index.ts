/* * */

import { main } from '@/main.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

(async function init() {
	const runOnInterval = async () => {
		//

		Logger.init();

		const globalTimer = new Timer();

		await main();

		Logger.terminate(`Operation completed in ${globalTimer.get()}`);

		setTimeout(runOnInterval, 300_000); // 5 minutes
	};
	runOnInterval();
})();
