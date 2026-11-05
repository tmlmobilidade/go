import { DAY_PERIOD_TIME_RANGES, type DayPeriod, DayPeriodsValues } from '@tmlmobilidade/go-types-offer';
import { type TFunction } from 'i18next';

export type DayPeriodLabels = Record<DayPeriod, {
	long: string
	long_with_time: string
	short: string
	short_with_time: string
}>;

/** Presentation labels only; stored keys and time ranges remain part of the Offer contract. */
export function getDayPeriodLabels(t: TFunction): DayPeriodLabels {
	return Object.fromEntries(DayPeriodsValues.map((period) => {
		const base = {
			long: t(`offerScheduling:dayPeriods.${period}.long`, ''),
			short: t(`offerScheduling:dayPeriods.${period}.short`, ''),
		};
		const range = DAY_PERIOD_TIME_RANGES[period];
		return [period, {
			...base,
			long_with_time: `${base.short} — ${base.long} (${range.start} - ${range.end})`,
			short_with_time: `${base.short} (${range.start} - ${range.end})`,
		}];
	})) as DayPeriodLabels;
}
