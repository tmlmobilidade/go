import { type AnalyticsEvent, type AnalyticsEventInput } from '../types/events/shared';

/* * */

/** Resolves the event title and schema defaults, keeping replay metadata separate from properties. */
export function normalizeAnalyticsEvent(event: AnalyticsEventInput): AnalyticsEvent {
	if (typeof event === 'string') return { title: event };
	return event.parse({ title: event.shape.title.value });
}
