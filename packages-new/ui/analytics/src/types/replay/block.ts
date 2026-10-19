/** Metadata for one capture block; recorded data is owned by the capture implementation. */
export interface AnalyticsReplayBlock {
	hasError: boolean
	id: string
	startedAt: number
}
