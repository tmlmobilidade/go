/* * */

import { migrateToFlagsModel } from '@/tasks/migrate-to-flags-model.js';

/* * */

await (async function main() {
	//

	//
	// Run tasks

	await migrateToFlagsModel();

	console.log('Done');

	//
})();
