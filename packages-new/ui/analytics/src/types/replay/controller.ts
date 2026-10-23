/* * */

/** Starts one support capture and allows it to be stopped before its five-minute limit. */
export interface AnalyticsReplayController {
	start: (activationId: string) => Promise<boolean>
	stop: () => void
}
