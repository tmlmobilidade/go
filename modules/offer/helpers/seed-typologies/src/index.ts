/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';
import { typologies } from '@tmlmobilidade/interfaces';

/* * */

(async function main() {
	//

	//
	// Delete existing typologies

	console.log('Deleting All');
	await typologies.deleteMany({});

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
