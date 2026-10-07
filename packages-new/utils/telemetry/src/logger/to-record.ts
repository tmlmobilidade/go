import { type LogLevel } from './levels.js';
import { type LogInput, type LogRecord } from './types/entry.js';

/**
 * Normalises any accepted input into a record.
 *
 * `Error` is checked before the object form: an Error also satisfies the entry shape
 * structurally, and treating it as one would drop its stack.
 */
export function toRecord(level: LogLevel, input: LogInput): LogRecord {
	if (typeof input === 'string') return { level, message: input };
	if (input instanceof Error) return { error: input, level, message: input.message };
	return { ...input, level, message: input.message ?? input.error?.message ?? '' };
}
