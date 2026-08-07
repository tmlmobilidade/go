/* * */

import { seedLinesFromGoV1 } from '@/tasks/seed-lines.js';
import { seedPatternsFromGoV1 } from '@/tasks/seed-patterns.js';
import { seedRoutesFromGoV1 } from '@/tasks/seed-routes.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/* * */

(async function main() {
	//

	//
	// Delete existing lines, routes, and patterns

	console.log('Deleting All Lines');
	await goDb.offer.lines.deleteMany({});
	console.log('Deleting All Routes');
	await goDb.offer.routes.deleteMany({});
	console.log('Deleting All Patterns');
	await goDb.offer.patterns.deleteMany({});

	//
	// Run tasks

	await seedLinesFromGoV1();
	await seedRoutesFromGoV1();
	await seedPatternsFromGoV1();

	console.log('Done');

	//
})();
