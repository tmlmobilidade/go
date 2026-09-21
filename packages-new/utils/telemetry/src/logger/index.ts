/* * */

import { init, terminate, title } from './handlers/dev/decorators.js';
import { error, fatal } from './handlers/dev/errors.js';
import { info } from './handlers/dev/info.js';
import { debug, success, warning } from './handlers/dev/messages.js';
import { progress } from './handlers/dev/progress.js';
import { divider } from './handlers/divider.js';
import { spacer } from './handlers/spacer.js';
import { error as structuredError, fatal as structuredFatal } from './handlers/structured/errors.js';
import { info as structuredInfo } from './handlers/structured/info.js';
import {
	debug as structuredDebug,
	progress as structuredProgress,
	success as structuredSuccess,
	warning as structuredWarning,
} from './handlers/structured/messages.js';

/* * */

const IS_DEV = process.env.ENVIRONMENT === 'dev';

/* * */

/**
 * Writes readable development logs and OpenTelemetry-compatible JSON logs in production.
 */
class LoggerClass {
	/** Writes a visual divider in development. No-op in production. */
	divider = IS_DEV ? divider : () => {};

	/** Writes blank lines in development. No-op in production. */
	spacer = IS_DEV ? spacer : () => {};

	/** Writes a debug message. */
	debug: typeof debug = IS_DEV ? debug : structuredDebug;

	/** Writes an informational message with optional structured attributes. */
	info: typeof info = IS_DEV ? info : structuredInfo;

	/** Writes an initialization block in development. No-op in production. */
	init: typeof init = IS_DEV ? init : () => {};

	/** Writes an informational progress message. */
	progress: typeof progress = IS_DEV ? progress : structuredProgress;

	/** Writes an informational success message. */
	success: typeof success = IS_DEV ? success : structuredSuccess;

	/** Writes a termination block in development. No-op in production. */
	terminate: typeof terminate = IS_DEV ? terminate : () => {};

	/** Writes a title in development. No-op in production. */
	title: typeof title = IS_DEV ? title : () => {};

	/** Writes a warning message. */
	warning: typeof warning = IS_DEV ? warning : structuredWarning;

	/** Writes an error message with optional exception attributes. */
	error: typeof error = IS_DEV ? error : structuredError;

	/** Writes a fatal message with optional exception attributes. */
	fatal: typeof fatal = IS_DEV ? fatal : structuredFatal;
}

/* * */

/** Shared application logger. */
export const logger = new LoggerClass();

export type { LogValue } from './types/log.js';
export type {
	ErrorArgs,
	InfoArgs,
	LoggerColumn,
	LoggerErrorContext,
	LoggerInfoContext,
	LoggerMessage,
	ProgressArgs,
} from './types/message.js';
