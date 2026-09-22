/* * */

import { type DevLogger as DevLoggerContract } from '../../types/dev-logger.js';
import { type StructuredLogger as StructuredLoggerContract } from '../../types/structured-logger.js';
import { error, fatal } from './errors.js';
import { info } from './info.js';
import { debug, progress, success, warning } from './messages.js';

/* * */

// The following imports provide console log utilities
// Note: These do not emit JSON records, only human-readable messages.
import { divider } from '../dev/divider.js';
import { init } from '../dev/init.js';
import { spacer } from '../dev/spacer.js';
import { terminate } from '../dev/terminate.js';
import { title } from '../dev/title.js';

/* * */

/**
 * Production logger that emits OpenTelemetry-compatible JSON records.
 * Decorative methods are no-ops.
 */
export class StructuredLogger implements DevLoggerContract, StructuredLoggerContract {
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
