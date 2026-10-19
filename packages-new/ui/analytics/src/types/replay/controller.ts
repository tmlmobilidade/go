import { type AnalyticsEvent } from '../events/shared';

/* * */

/** Controls consecutive capture blocks and their retention policy. */
export interface AnalyticsReplayController {
	recordEvent: (event: AnalyticsEvent) => void
	start: () => Promise<boolean>
	stop: () => void
}
