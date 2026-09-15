/* * */

import { GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1CalendarDatesSchema = z.object({
	...GtfsCalendarDatesSchema.shape,
});

export type OperationPostersV1CalendarDates = z.output<typeof OperationPostersV1CalendarDatesSchema>;
