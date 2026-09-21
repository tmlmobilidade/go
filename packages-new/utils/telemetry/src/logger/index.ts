/* * */

import { divider } from './handlers/divider.js';
import { spacer } from './handlers/spacer.js';

/* * */

//
// Check if the environment is development
// Used to disable logger functions in non local environments
const IS_DEV = process.env.ENVIROMENT === 'dev';

/* * */

class LoggerClass {
	//

	/* UNKNOWN */
	divider = IS_DEV ? divider : () => {};
	spacer = IS_DEV ? spacer : () => {};

	/* DEBUG */
	debug;

	/* INFO */
	info;
	init;
	progress;
	success;
	terminate;
	title;

	/* WARNING */
	warning;

	/* ERROR */
	error;

	/* FATAL */
	fatal;

	//
}

/* * */

export const logger = new LoggerClass();
