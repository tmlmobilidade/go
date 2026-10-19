import { type AnalyticsEvent } from '../types/events/shared';
import { type AnalyticsReplayBlock } from '../types/replay/block';

/* * */

/** Modules opt events into retention explicitly, regardless of the event name. */
export function shouldRetainReplayEvent(event: AnalyticsEvent): boolean {
	return event.replay?.retain === true;
}

/** A block is retained if at least one qualifying event occurred during capture. */
export function shouldRetainReplayBlock(block: AnalyticsReplayBlock): boolean {
	return block.hasError;
}
