import { hhmm, type HHMM } from '@/dates/common.js';
import { z } from 'zod';

export const DayPeriodsValues = ['PPM', 'CD', 'PPT', 'N', 'M'] as const;
export const DayPeriodSchema = z.enum(DayPeriodsValues);
export type DayPeriod = z.infer<typeof DayPeriodSchema>;

export interface DayPeriodTimeRangeSegment {
	end: HHMM
	start: HHMM
}

export type DayPeriodTimeRanges = Record<DayPeriod, DayPeriodTimeRangeSegment[]>;

export const DAY_PERIOD_TIME_RANGES: DayPeriodTimeRanges = {
	CD: [
		{ end: hhmm('15:59'), start: hhmm('10:00') },
	],
	M: [
		{ end: hhmm('05:59'), start: hhmm('04:00') },
		{ end: hhmm('27:59'), start: hhmm('24:00') },
	],
	N: [
		{ end: hhmm('23:59'), start: hhmm('20:00') },
	],
	PPM: [
		{ end: hhmm('09:59'), start: hhmm('06:00') },
	],
	PPT: [
		{ end: hhmm('19:59'), start: hhmm('16:00') },
	],
};

const DAY_PERIOD_LABEL_BASE: Record<DayPeriod, { long: string, short: string }> = {
	CD: { long: 'Corpo do Dia', short: 'CD' },
	M: { long: 'Madrugada', short: 'M' },
	N: { long: 'Noite', short: 'N' },
	PPM: { long: 'Período de ponta da manhã', short: 'PPM' },
	PPT: { long: 'Período de ponta da tarde', short: 'PPT' },
};

export type DayPeriodLabels = Record<
	DayPeriod,
	{ long: string, long_with_time: string, short: string, short_with_time: string }
>;

export const DAY_PERIOD_LABELS: DayPeriodLabels = Object.fromEntries(
	DayPeriodsValues.map((period) => {
		const base = DAY_PERIOD_LABEL_BASE[period];
		const ranges = DAY_PERIOD_TIME_RANGES[period];
		const rangesLabel = ranges.map(range => `${range.start} - ${range.end}`).join(' · ');

		return [
			period,
			{
				...base,
				long_with_time: `${base.short} — ${base.long} (${rangesLabel})`,
				short_with_time: `${base.short} (${rangesLabel})`,
			},
		] as const;
	}),
) as DayPeriodLabels;
