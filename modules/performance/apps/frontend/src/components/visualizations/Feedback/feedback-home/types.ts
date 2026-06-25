/* * */

export interface FeedbackPreviewResponse {
	columns: string[]
	rows: Record<string, unknown>[]
	source: {
		database: string
		table: string
	}
}
