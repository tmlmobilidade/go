/* * */

import { z } from 'zod';

/* * */

export const CalendarAssignmentsExtSchema = z.object({
	day_type_id: z.string(),
	service_id: z.string(),
});

export type CalendarAssignmentsExt = z.output<typeof CalendarAssignmentsExtSchema>;
