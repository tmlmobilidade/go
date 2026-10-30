/* * */

import { type AnalyticsReplayActivation } from './activation';

/* * */

/** Starts one support capture and allows it to be stopped before its five-minute limit. */
export interface AnalyticsReplayController {
	start: (activation: AnalyticsReplayActivation) => Promise<boolean>
	stop: () => void
}
