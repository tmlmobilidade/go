/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/* * */

(async function main() {
	//

	//
	// Delete existing fares

	console.log('Deleting All');
	await goDb.offer.fares.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
