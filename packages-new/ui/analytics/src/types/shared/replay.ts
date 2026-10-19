/** Metadata for one capture block; recorded data is owned by the capture implementation. */
export interface AnalyticsReplayBlock {
	hasError: boolean
	id: string
	startedAt: number
}

/** SDK capture controls. Stopping capture does not discard previously recorded data. */
export interface AnalyticsReplayController {
	start: () => Promise<boolean>
	stop: () => void
}
