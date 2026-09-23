/** Semantic kind of a log line. Each level maps to exactly one OpenTelemetry severity. */
export type LogLevel = 'critical' | 'debug' | 'error' | 'info' | 'progress' | 'success' | 'warning';

/**
 * OpenTelemetry severity for each level.
 *
 * `success` and `progress` are INFO: they exist so the development renderer can
 * draw them differently, not because they carry a different severity.
 */
export const SEVERITY = {
	critical: { number: 21, text: 'FATAL' },
	debug: { number: 5, text: 'DEBUG' },
	error: { number: 17, text: 'ERROR' },
	info: { number: 9, text: 'INFO' },
	progress: { number: 9, text: 'INFO' },
	success: { number: 9, text: 'INFO' },
	warning: { number: 13, text: 'WARN' },
} as const satisfies Record<LogLevel, { number: number, text: string }>;
