import { z } from 'zod';

export const DayPeriodsValues = ['PPM', 'CD', 'PPT', 'N', 'M'] as const;
export const DayPeriodSchema = z.enum(DayPeriodsValues);
export type DayPeriod = z.infer<typeof DayPeriodSchema>;

export interface DayPeriodTimeRange {
	end: string
	start: string
}

export const DAY_PERIOD_TIME_RANGES: Record<DayPeriod, DayPeriodTimeRange> = {
	CD: { end: '15:59', start: '10:00' },
	M: { end: '05:59', start: '00:00' },
	N: { end: '23:59', start: '20:00' },
	PPM: { end: '09:59', start: '06:00' },
	PPT: { end: '19:59', start: '16:00' },
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
		const range = DAY_PERIOD_TIME_RANGES[period];
		return [
			period,
			{
				...base,
				long_with_time: `${base.short} — ${base.long} (${range.start} - ${range.end})`,
				short_with_time: `${base.short} (${range.start} - ${range.end})`,
			},
		] as const;
	}),
) as DayPeriodLabels;
