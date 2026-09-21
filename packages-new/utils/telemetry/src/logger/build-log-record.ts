import { type LogLevel, LogLevelValues } from './types/levels.js';
import { type LogValue } from './types/log.js';

/**
 * Builds an OpenTelemetry-compatible log record.
 */
export function buildLogRecord(
	level: LogLevel,
	body: string,
	attributes?: Record<string, unknown>,
	error?: Error,
): LogValue {
	const severity = LogLevelValues[level];
	const exceptionAttributes = error
		? {
			'exception.message': error.message,
			'exception.stacktrace': error.stack,
			'exception.type': error.constructor.name,
		}
		: undefined;
	const combinedAttributes = { ...attributes, ...exceptionAttributes };

	return {
		attributes: Object.keys(combinedAttributes).length ? combinedAttributes : undefined,
		body,
		severity_number: severity.number,
		severity_text: severity.text,
		timestamp: new Date().toISOString(),
	};
}
