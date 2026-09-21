import { type LogValue } from './types/log.js';

/**
 * Serializes a log record as one JSON line.
 */
export function emitLog(record: LogValue, toStderr = false): void {
	(toStderr ? console.error : console.log)(JSON.stringify(record));
}
