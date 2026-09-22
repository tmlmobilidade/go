import { type LogLevel } from '../levels.js';

interface LogEntryFields {
	/** Structured fields. Emitted as OpenTelemetry `attributes` in production; not rendered in development. */
	attributes?: Record<string, unknown>

	/** Error to attach. Development prints its stack; production emits `exception.*` attributes. */
	error?: Error

	/** Human-readable text. Defaults to `error.message` when omitted. */
	message?: string

	/** Development only: blank lines printed after the entry. Ignored in production. */
	spacesAfter?: number

	/** Development only: blank lines printed before the entry. Ignored in production. */
	spacesBefore?: number
}

/** Object form accepted by every level method. Requires a message or an error. */
export type LogEntry = LogEntryFields & ({ error: Error } | { message: string });

/**
 * Anything a level method accepts.
 *
 * `Error` is listed explicitly on purpose: an Error is structurally a `{ message: string }`,
 * so without this member (and the `instanceof` check in `toRecord`) a bare Error would be
 * treated as an entry with no error attached and its stack would be lost.
 */
export type LogInput = Error | LogEntry | string;

/** Fully resolved entry handed to a renderer. */
export interface LogRecord extends Omit<LogEntryFields, 'message'> {
	level: LogLevel
	message: string
}
