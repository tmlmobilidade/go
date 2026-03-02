/* * */

import { runImport } from './main.js';

export * from './imports/lines-routes.js';
export * from './main.js';
export * from './types.js';
export * from './utils.js';

runImport().catch((error) => {
	console.error(error);
	process.exit(1);
});
