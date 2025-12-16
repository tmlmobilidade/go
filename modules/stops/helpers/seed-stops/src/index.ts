/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { stops } from '@tmlmobilidade/interfaces';

/* * */

(async function main() {
	//

	//
	// Delete existing stops

	console.log('Deleting All');
	await stops.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	//
})();
