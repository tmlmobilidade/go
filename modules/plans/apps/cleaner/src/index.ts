/* * */

import { cleanOldValidations } from '@/tasks/clean-old-validations.js';
import { ensureGtfsFiles } from '@/tasks/ensure-gtfs-files.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	await cleanOldValidations();
	await ensureGtfsFiles();
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
