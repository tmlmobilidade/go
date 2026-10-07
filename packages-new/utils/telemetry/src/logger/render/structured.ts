import { SEVERITY } from '../levels.js';
import { type LogRenderer } from '../types/logger.js';

/** OpenTelemetry-compatible JSON log record emitted in production. */
export interface OtelLogRecord {
	/** Structured event attributes, including `exception.*` when an error is attached. */
	attributes?: Record<string, unknown>

	/** Human-readable event message. */
	body: string

	/** OpenTelemetry severity number. */
	severity_number: number

	/** OpenTelemetry severity name. */
	severity_text: string

	/** ISO 8601 event timestamp. */
	timestamp: string
}

/** OpenTelemetry semantic-convention attributes for an attached error. */
function exceptionAttributes(error?: Error): Record<string, unknown> {
	if (!error) return {};
	return {
		'exception.message': error.message,
		'exception.stacktrace': error.stack,
		'exception.type': error.constructor.name,
	};
}

/**
 * One JSON line per record, for Grafana Alloy/Loki.
 *
 * Records at `error` severity and above go to stderr, everything else to stdout.
 * `spacesBefore`/`spacesAfter` are development hints and are ignored here.
 */
export const renderStructured: LogRenderer = (record) => {
	const { number, text } = SEVERITY[record.level];
	const attributes = { ...record.attributes, ...exceptionAttributes(record.error) };
	const line: OtelLogRecord = {
		attributes: Object.keys(attributes).length ? attributes : undefined,
		body: record.message,
		severity_number: number,
		severity_text: text,
		timestamp: new Date().toISOString(),
	};
	(number >= SEVERITY.error.number ? console.error : console.log)(JSON.stringify(line));
};
