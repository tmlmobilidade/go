/* * */

import { syncPcgiCore } from '@/pcgi-core.js';
import { syncPcgiLog } from '@/pcgi-log.js';

/* * */

(async function init() {
	//

	const runOnInterval = async () => {
		//

		await syncPcgiCore();

		await syncPcgiLog();

		setTimeout(runOnInterval, 1_800_000); // 30 minutes
	};

	runOnInterval();

	//
})();
