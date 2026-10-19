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
