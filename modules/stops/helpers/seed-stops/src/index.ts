/* * */

import { seedFromTmp } from '@/tasks/seed-from-tmp.js';

/* * */

await (async function main() {
	//

	//
	// Run tasks

	await seedFromTmp();

	console.log('Done');

	//
})();
