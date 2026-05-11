/* * */

import { cleanOldValidations } from '@/tasks/clean-old-validations.js';
import { ensureGtfsFiles } from '@/tasks/ensure-gtfs-files.js';
import { publishApprovedPlansFeed } from '@/tasks/publish-approved-plans.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	await publishApprovedPlansFeed();
	await cleanOldValidations();
	await ensureGtfsFiles();
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
