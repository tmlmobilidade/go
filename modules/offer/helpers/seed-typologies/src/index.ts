/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';

/* * */

(async function main() {
	//

	//
	// Delete existing typologies

	console.log('Deleting All');
	await goDB.offer.typologies.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
