/* * */

import { DevLogger } from './handlers/dev/logger.js';
import { StructuredLogger } from './handlers/structured/logger.js';
import { type DevLogger as DevLoggerContract } from './types/dev-logger.js';
import { type StructuredLogger as StructuredLoggerContract } from './types/structured-logger.js';

/* * */

const IS_DEV = process.env.ENVIRONMENT === 'dev';

/* * */

/**
 * Application logger. Uses human-readable output in development and
 * OpenTelemetry-compatible JSON in production.
 */
class Logger implements DevLoggerContract, StructuredLoggerContract {
	debug: DevLoggerContract['debug'];
	divider: DevLoggerContract['divider'];
	error: DevLoggerContract['error'];
	fatal: DevLoggerContract['fatal'];
	info: DevLoggerContract['info'];
	init: DevLoggerContract['init'];
	progress: DevLoggerContract['progress'];
	spacer: DevLoggerContract['spacer'];
	success: DevLoggerContract['success'];
	terminate: DevLoggerContract['terminate'];
	title: DevLoggerContract['title'];
	warning: DevLoggerContract['warning'];

	constructor() {
		Object.assign(this, IS_DEV ? new DevLogger() : new StructuredLogger());
	}
}

/* * */

/** Shared application logger. */
export const logger = new Logger();

export type { DevLogger } from './types/dev-logger.js';
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
export type { StructuredLogger } from './types/structured-logger.js';
