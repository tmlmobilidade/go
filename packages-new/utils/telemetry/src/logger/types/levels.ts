export type LogLevel = 'critical' | 'debug' | 'error' | 'info' | 'trace' | 'unknown' | 'warning';

export const LogLevelValues = {
	critical: { number: 21, text: 'FATAL' },
	debug: { number: 5, text: 'DEBUG' },
	error: { number: 17, text: 'ERROR' },
	info: { number: 9, text: 'INFO' },
	trace: { number: 1, text: 'TRACE' },
	unknown: { number: 0, text: 'UNKNOWN' },
	warning: { number: 13, text: 'WARN' },
} as const satisfies Record<LogLevel, { number: number, text: string }>;

