/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const CalendarDatesSchema = z.object({
	date: OperationalDateIntSchema,
	exception_type: z.enum(['1', '2']),
	service_id: z.string(),
});

export type CalendarDates = z.output<typeof CalendarDatesSchema>;
