/* * */

import { z } from 'zod';

/* * */

export const SamTimelineAccentSchema = z.enum(['green', 'orange', 'red', 'white']);
export type SamTimelineAccent = z.infer<typeof SamTimelineAccentSchema>;

export const SamTimelineMonthSchema = z.object({
	failed_count: z.number().int().nonnegative().default(0),
	month: z.string(), // yyyy-MM
	successful_count: z.number().int().nonnegative().default(0),
});
export type SamTimelineMonth = z.infer<typeof SamTimelineMonthSchema>;

export const SamTimelineUndatedSchema = z.object({
	failed_count: z.number().int().nonnegative().default(0),
	successful_count: z.number().int().nonnegative().default(0),
});
export type SamTimelineUndated = z.infer<typeof SamTimelineUndatedSchema>;

export const SamTimelineSummarySchema = z.object({
	months: z.array(SamTimelineMonthSchema).default([]),
	undated: SamTimelineUndatedSchema.optional().nullable(),
});
export type SamTimelineSummary = z.infer<typeof SamTimelineSummarySchema>;

