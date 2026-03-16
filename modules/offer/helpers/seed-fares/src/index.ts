/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { fares } from '@tmlmobilidade/interfaces';

/* * */

(async function main() {
	//

	//
	// Delete existing fares

	console.log('Deleting All');
	await fares.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
