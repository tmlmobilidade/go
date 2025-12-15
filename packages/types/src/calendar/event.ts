/* * */

import { TablerIcon } from '@tabler/icons-react';
import { z } from 'zod';

/* * */

export const CalendarEventSchema = z.object({
	color: z.string().optional(),
	description: z.string().optional(),
	endDate: z.string().optional(),
	icon: z.custom<TablerIcon>().optional(),
	id: z.string(),
	metadata: z.record(z.unknown()).optional(),
	startDate: z.string(),
	title: z.string(),
	type: z.enum(['event', 'period']).optional(),
});

export interface CalendarEventMetadata {
	[key: string]: unknown
	agency_id?: string
	agency_name?: string
	type?: 'annotation' | 'period'
}

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
