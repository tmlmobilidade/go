import { z } from 'zod';

/* * */

/** Shared contract for the event schemas defined by each module. */
export const AnalyticsEvent = z.object({
	title: z.string(),
});

/* * */

export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;

/** A concrete module schema provides a fixed event title. */
export interface AnalyticsEventDefinition {
	parse: (value: unknown) => AnalyticsEvent
	shape: {
		title: { value: string }
	}
}

/** Strings remain supported for existing consumers. */
export type AnalyticsEventInput = AnalyticsEventDefinition | string;
