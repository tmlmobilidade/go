import { z } from 'zod';

export const DayPeriodsValues = ['PPM', 'CD', 'PPT', 'N', 'M'] as const;
export const DayPeriodSchema = z.enum(DayPeriodsValues);
export type DayPeriod = z.infer<typeof DayPeriodSchema>;

export interface DayPeriodTimeRange {
	end: string
	start: string
}

export const DAY_PERIOD_TIME_RANGES: Record<DayPeriod, DayPeriodTimeRange> = {
	PPT: { end: '19:59', start: '17:00' },
	CD: { end: '16:59', start: '10:00' },
	M: { end: '06:59', start: '04:00' },
	PPM: { end: '09:59', start: '07:00' },
	N: { end: '03:59', start: '20:00' },
};
