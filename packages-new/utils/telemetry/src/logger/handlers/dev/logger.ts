/* * */

import { type DevLogger as DevLoggerContract } from '../../types/dev-logger.js';
import { divider } from './divider.js';
import { error, fatal } from './errors.js';
import { info } from './info.js';
import { init } from './init.js';
import { debug, success, warning } from './messages.js';
import { progress } from './progress.js';
import { spacer } from './spacer.js';
import { terminate } from './terminate.js';
import { title } from './title.js';

/* * */

/**
 * Development logger that writes human-readable console output.
 */
export class DevLogger implements DevLoggerContract {
	debug = debug;
	divider = divider;
	error = error;
	fatal = fatal;
	info = info;
	init = init;
	progress = progress;
	spacer = spacer;
	success = success;
	terminate = terminate;
	title = title;
	warning = warning;
}
