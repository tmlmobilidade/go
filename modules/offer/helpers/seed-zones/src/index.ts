/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';

/* * */

(async function main() {
	//

	//
	// Delete existing zones

	console.log('Deleting All');
	await goDB.offer.zones.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
