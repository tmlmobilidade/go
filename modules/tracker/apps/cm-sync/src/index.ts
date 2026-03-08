/* * */

import { syncPcgiCore } from '@/tasks/sync-pcgi-core.js';
import { syncPcgiLog } from '@/tasks/sync-pcgi-log.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/**
 * Perform a hard sync of all documents every 30 minutes,
 * to ensure that any missed documents are eventually integrated.
 */
const main = async () => {
	await syncPcgiCore();
	await syncPcgiLog();
};

await runOnInterval(main, 1_800_000);
