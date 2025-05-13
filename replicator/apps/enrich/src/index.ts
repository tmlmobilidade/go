/* * */

import { syncApexOnBoardSales } from '@/tasks/sync-apex-on-board-sales.js';

/* * */

const RUN_INTERVAL = 1800000; // 30 minutes

/* * */

(async function init() {
	//

	//
	// Ensure that all documents are synced between collections
	// by checking the presence of each individual document ID.

	const runOnInterval = async () => {
		await syncApexOnBoardSales();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};

	runOnInterval();

	//
})();
