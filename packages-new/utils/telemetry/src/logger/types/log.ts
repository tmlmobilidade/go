export interface LogValue {
	attributes?: Record<string, unknown>
	body: string
	severity_number: number
	severity_text: string
	timestamp: string
}
