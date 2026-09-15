/* * */

import { GtfsCalendarSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1CalendarsSchema = z.object({
	...GtfsCalendarSchema.shape,
});

export type OperationPostersV1Calendars = z.output<typeof OperationPostersV1CalendarsSchema>;
