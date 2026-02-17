/* * */

import { syncPcgiCore } from '@/tasks/sync-pcgi-core.js';
import { syncPcgiLog } from '@/tasks/sync-pcgi-log.js';
import { pcgidbLegacy } from '@tmlmobilidade/interfaces';

/* * */

(async function init() {
	//

	await pcgidbLegacy.connect();

	//
	// Perform a hard sync of all documents every 30 minutes,
	// to ensure that any missed documents are eventually integrated.

	const runOnInterval = async () => {
		await syncPcgiCore();
		await syncPcgiLog();
		setTimeout(runOnInterval, 1_800_000); // 30 minutes
	};

	runOnInterval();

	//
})();
