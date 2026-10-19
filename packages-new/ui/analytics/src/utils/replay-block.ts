import { type AnalyticsEvent } from '../types/shared/event';
import { type AnalyticsReplayBlock } from '../types/shared/replay';
import { shouldRetainReplayEvent } from './replay-retention';

/* * */

/** Each block starts with its own retention state. */
export function createReplayBlock(id: string, startedAt: number): AnalyticsReplayBlock {
	return { hasError: false, id, startedAt };
}

/** Retention remains enabled for the block once a qualifying event occurs. */
export function updateReplayBlock(block: AnalyticsReplayBlock, event: AnalyticsEvent): AnalyticsReplayBlock {
	if (block.hasError || !shouldRetainReplayEvent(event)) return block;
	return { ...block, hasError: true };
}
