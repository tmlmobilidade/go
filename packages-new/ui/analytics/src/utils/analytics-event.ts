import { type AnalyticsEvent, type AnalyticsEventInput } from '../types/events/shared';

/* * */

export function normalizeAnalyticsEvent(event: AnalyticsEventInput): AnalyticsEvent {
	if (typeof event === 'string') return { title: event };

	return event.parse({ title: event.shape.title.value });
}
