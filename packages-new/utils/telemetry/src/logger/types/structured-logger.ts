/* * */

import { type ErrorArgs, type InfoArgs, type LoggerMessage, type ProgressArgs } from './message.js';

/* * */

/**
 * Logger that emits OpenTelemetry-compatible structured records.
 */
export interface StructuredLogger {
	debug(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void
	error(args: ErrorArgs): void
	fatal(args: ErrorArgs): void
	info(args: InfoArgs): void
	progress(args: ProgressArgs): void
	success(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void
	warning(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void
}
