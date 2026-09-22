/* * */

import { type ErrorArgs, type InfoArgs, type ProgressArgs } from './message.js';

/* * */

/**
 * Logger that emits OpenTelemetry-compatible structured records.
 */
export interface StructuredLogger {
	debug(args: InfoArgs): void
	error(args: ErrorArgs): void
	fatal(args: ErrorArgs): void
	info(args: InfoArgs): void
	progress(args: ProgressArgs): void
	success(args: InfoArgs): void
	warning(args: ErrorArgs): void
}
