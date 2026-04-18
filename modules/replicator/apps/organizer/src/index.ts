/* * */

import { categorizeValidations } from '@/tasks/categorize-validations.js';
import { linkRefundsToSalesToValidations } from '@/tasks/link-refunds.js';
import { linkSalesToValidations } from '@/tasks/link-sales.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	await linkRefundsToSalesToValidations();
	await linkSalesToValidations();
	await categorizeValidations();
}

/* * */

await runOnInterval(main, { intervalMs: 60_000 }); // 60 seconds
