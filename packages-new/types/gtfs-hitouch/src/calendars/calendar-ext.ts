/* * */

import { z } from 'zod';

/* * */

export const CalendarExtSchema = z.object({
	comment: z.string(),
	index: z.string(),
	service_id: z.string(),
});

export type CalendarExt = z.output<typeof CalendarExtSchema>;
