/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OperationPostersV1CalendarsSchema = z.object({
	end_date: OperationalDateIntSchema,
	friday: z.enum(['0', '1']).default('0'),
	monday: z.enum(['0', '1']).default('0'),
	saturday: z.enum(['0', '1']).default('0'),
	service_id: z.string(),
	start_date: OperationalDateIntSchema,
	sunday: z.enum(['0', '1']).default('0'),
	thursday: z.enum(['0', '1']).default('0'),
	tuesday: z.enum(['0', '1']).default('0'),
	wednesday: z.enum(['0', '1']).default('0'),
});

export type OperationPostersV1Calendars = z.output<typeof OperationPostersV1CalendarsSchema>;
