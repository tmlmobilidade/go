/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OperationPostersV1CalendarDatesSchema = z.object({
	date: OperationalDateIntSchema,
	exception_type: z.enum(['1', '2']),
	service_id: z.string(),
});

export type OperationPostersV1CalendarDates = z.output<typeof OperationPostersV1CalendarDatesSchema>;
