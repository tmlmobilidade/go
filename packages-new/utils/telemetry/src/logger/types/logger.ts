import { type LogLevel } from '../levels.js';
import { type LogInput, type LogRecord } from './entry.js';

/** Renders one resolved record. This is the only thing that differs between development and production. */
export type LogRenderer = (record: LogRecord) => void;

type LevelMethod = (input: LogInput) => void;

/**
 * Public logger API. Identical in every environment; only rendering differs.
 *
 * Extending `Record<LogLevel, LevelMethod>` means adding a value to `LogLevel`
 * without a matching method is a compile error.
 */
export interface Logger extends Record<LogLevel, LevelMethod> {
	divider(message?: string, size?: number): void

	init(): void
	/** Generic entry point. Every level method is shorthand for `log(level, input)`. */
	log(level: LogLevel, input: LogInput): void
	spacer(lines?: number): void
	terminate(message: string): void
	title(message: string): void
}
