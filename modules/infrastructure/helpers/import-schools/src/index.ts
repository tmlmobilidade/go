/* * */

import { importSchools } from '@/tasks/import-schools.js';

/* * */

try {
	await importSchools({ write: process.argv.includes('--write') });
	process.exit(0);
} catch (error) {
	console.error((error as Error).message);
	process.exit(1);
}
