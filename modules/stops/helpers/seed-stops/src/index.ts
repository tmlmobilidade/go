/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { seedFromTmp } from '@/tasks/seed-from-tmp.js';
import { stops } from '@tmlmobilidade/interfaces';

/* * */

await (async function main() {
	//

	//
	// Delete existing stops

	console.log('Deleting All');
	await stops.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();
	await seedFromTmp();

	console.log('Done');

	//
})();
