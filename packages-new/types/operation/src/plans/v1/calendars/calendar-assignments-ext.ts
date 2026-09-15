/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1CalendarAssignmentsExtSchema = z.object({
	day_type_id: z.string(),
	service_id: z.string(),
});

export type OperationPostersV1CalendarAssignmentsExt = z.output<typeof OperationPostersV1CalendarAssignmentsExtSchema>;
