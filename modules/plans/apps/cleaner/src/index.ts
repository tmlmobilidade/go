/* * */

import { cleanOldValidations } from '@/tasks/clean-old-validations.js';
import { ensureGtfsFiles } from '@/tasks/ensure-gtfs-files.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	await cleanOldValidations();
	await ensureGtfsFiles();
}

runOnInterval(main, 300_000); // 5 minutes in milliseconds
