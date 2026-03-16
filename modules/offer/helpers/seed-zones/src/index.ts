/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { zones } from '@tmlmobilidade/interfaces';

/* * */

(async function main() {
	//

	//
	// Delete existing zones

	console.log('Deleting All');
	await zones.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
