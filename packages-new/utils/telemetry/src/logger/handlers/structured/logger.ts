/* * */

import { type DevLogger as DevLoggerContract } from '../../types/dev-logger.js';
import { type StructuredLogger as StructuredLoggerContract } from '../../types/structured-logger.js';
import { error, fatal } from './errors.js';
import { info } from './info.js';
import { debug, progress, success, warning } from './messages.js';

/* * */

const noop = () => {};

/**
 * Production logger that emits OpenTelemetry-compatible JSON records.
 * Decorative methods are no-ops.
 */
export class StructuredLogger implements DevLoggerContract, StructuredLoggerContract {
	debug = debug;
	divider = noop;
	error = error;
	fatal = fatal;
	info = info;
	init = noop;
	progress = progress;
	spacer = noop;
	success = success;
	terminate = noop;
	title = noop;
	warning = warning;
}
