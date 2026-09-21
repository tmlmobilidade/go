/** OpenTelemetry-compatible JSON log record emitted in production. */
export interface LogValue {
	/** Structured event attributes. */
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
