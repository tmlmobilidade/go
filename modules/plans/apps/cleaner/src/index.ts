/* * */

import { cleanOldValidations } from '@/tasks/clean-old-validations.js';
import { ensureGtfsFiles } from '@/tasks/ensure-gtfs-files.js';

/* * */

await (async function init() {
	const runOnInterval = async () => {
		//

		await cleanOldValidations();

		await ensureGtfsFiles();

		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
