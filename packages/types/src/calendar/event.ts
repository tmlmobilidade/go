/* * */

import { z } from 'zod';

/* * */

export const CalendarEventSchema = z.object({
	color: z.string().optional(),
	description: z.string().optional(),
	display: z.enum(['cell', 'strip', 'dot']).optional(),
	endDate: z.string().optional(),
	icon: z.any().optional(),
	id: z.string(),
	metadata: z.record(z.unknown()).optional(),
	startDate: z.string(),
	title: z.string(),
	type: z.enum(['annotation', 'period', 'holiday', 'event', 'rule-impact']).optional(),
});

export const CalendarEventTypeEnum = CalendarEventSchema.shape.type;

export type CalendarEventType = NonNullable<z.infer<typeof CalendarEventTypeEnum>>;

export interface CalendarEventMetadata {
	[key: string]: unknown
	agency_ids?: string
	agency_names?: string
}

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
