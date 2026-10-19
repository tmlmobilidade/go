/** SDK capture controls. Stopping capture does not discard previously recorded data. */
export interface AnalyticsReplayController {
	start: () => Promise<boolean>
	stop: () => void
}
