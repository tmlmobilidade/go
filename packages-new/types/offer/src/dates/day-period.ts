import { z } from 'zod';

export const DayPeriodsValues = ['morning_peak', 'daytime', 'afternoon_peak', 'night', 'early_morning'] as const;
export const DayPeriodSchema = z.enum(DayPeriodsValues);
export type DayPeriod = z.infer<typeof DayPeriodSchema>;

export interface DayPeriodTimeRange {
	end: string
	start: string
}

export const DAY_PERIOD_TIME_RANGES: Record<DayPeriod, DayPeriodTimeRange> = {
	afternoon_peak: { end: '19:59', start: '17:00' },
	daytime: { end: '16:59', start: '10:00' },
	early_morning: { end: '06:59', start: '04:00' },
	morning_peak: { end: '09:59', start: '07:00' },
	night: { end: '03:59', start: '20:00' },
};
