/* * */

import { seedFromGoV1 } from '@/tasks/seed-from-go-v1.js';

/* * */

(async function main() {
	//

	//
	// Run tasks

	await seedFromGoV1();

	console.log('Done');

	//
})();
