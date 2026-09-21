export type LogLevel = 'critical' | 'debug' | 'error' | 'info' | 'trace' | 'unknown' | 'warning';

export const LogLevelValues = {
	critical: { number: 0, text: 'CRITICAL' },
	debug: { number: 7, text: 'DEBUG' },
	error: { number: 3, text: 'ERROR' },
	info: { number: 5, text: 'INFO' },
	trace: { number: 8, text: 'TRACE' },
	unknown: { number: 9, text: 'UNKNOWN' },
	warning: { number: 4, text: 'WARNING' },
} as const satisfies Record<LogLevel, { number: number, text: string }>;

