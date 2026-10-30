/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1CalendarExtSchema = z.object({
	comment: z.string(),
	index: z.string(),
	service_id: z.string(),
});

export type OperationPostersV1CalendarExt = z.output<typeof OperationPostersV1CalendarExtSchema>;
