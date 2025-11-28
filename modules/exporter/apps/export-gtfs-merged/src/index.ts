/* * */

import { main } from '@/main.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

(async function () {
	const runOnInterval = async () => {
		//

		Logger.init();

		const globalTimer = new Timer();

		await main();

		Logger.terminate(`Operation completed in ${globalTimer.get()}`);

		setTimeout(runOnInterval, 60_000); // 1 minute
	};
	runOnInterval();
})();
