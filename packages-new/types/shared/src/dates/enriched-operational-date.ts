/* * */

import { z } from 'zod';

import { CalendarDateSchema } from './calendar-date.js';
import { OperationalDateIntSchema } from './operational-date-int.js';

/* * */

export const OperationalDateDayTypeSchema = z.enum(['1', '2', '3']);
export const OperationalDateHolidaySchema = z.enum(['0', '1']);
export const OperationalDatePeriodSchema = z.enum(['1', '2', '3']);
export const OperationalDateWeekdaySchema = z.enum(['1', '2', '3', '4', '5', '6', '7']);

export const OperationalDateMetadataSchema = z.object({
	day_type: OperationalDateDayTypeSchema,
	holiday: OperationalDateHolidaySchema,
	holiday_name: z.string().nullable(),
	notes: z.string().nullable(),
	period: OperationalDatePeriodSchema,
	weekday: OperationalDateWeekdaySchema,
});

export const EnrichedOperationalDateSchema = OperationalDateMetadataSchema.extend({
	calendar_date: CalendarDateSchema,
	operational_date: OperationalDateIntSchema,
});

export type EnrichedOperationalDate = z.infer<typeof EnrichedOperationalDateSchema>;
export type OperationalDateDayType = z.infer<typeof OperationalDateDayTypeSchema>;
export type OperationalDateHoliday = z.infer<typeof OperationalDateHolidaySchema>;
export type OperationalDateMetadata = z.infer<typeof OperationalDateMetadataSchema>;
export type OperationalDatePeriod = z.infer<typeof OperationalDatePeriodSchema>;
export type OperationalDateWeekday = z.infer<typeof OperationalDateWeekdaySchema>;

