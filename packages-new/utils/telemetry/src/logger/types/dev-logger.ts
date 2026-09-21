/* * */

import { type StructuredLogger } from './structured-logger.js';

/* * */

/**
 * Logger that writes human-readable console output for local development.
 */
export interface DevLogger extends StructuredLogger {
	divider(message?: string, size?: number): void
	init(): void
	spacer(lines?: number): void
	terminate(message: string): void
	title(message: string): void
}
