import { z } from 'zod';

/* * */

/** Shared event contract. Replay retention is local policy metadata, separate from event properties. */
export const AnalyticsEvent = z.object({
	replay: z.object({
		retain: z.boolean(),
	}).optional(),
	title: z.string(),
});

/* * */

export type AnalyticsEvent = z.infer<typeof AnalyticsEvent>;

/** A concrete module schema provides a fixed event title and resolves its policy metadata. */
export interface AnalyticsEventDefinition {
	parse: (value: unknown) => AnalyticsEvent
	shape: {
		title: { value: string }
	}
}

/** Strings remain supported for existing consumers. */
export type AnalyticsEventInput = AnalyticsEventDefinition | string;
