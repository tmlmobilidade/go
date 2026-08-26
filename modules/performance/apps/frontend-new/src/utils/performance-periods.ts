import { formatOperationalDate, parseOperationalDate, shiftOperationalDays } from '@/utils/operational-dates';

/* * */

export type PeriodPreset = 'custom' | 'last-7-days' | 'month-to-date' | 'today' | 'yesterday';

export type PerformanceComparison =
  | 'comparable-weekdays'
  | 'previous-period'
  | 'previous-week'
  | 'same-period-last-month';

export type PerformanceScreen = 'analysis' | 'pulse';

export interface PerformancePeriod {
	endDate: string
	startDate: string
}

export interface PerformancePeriodSelection {
	endDate?: string
	preset: PeriodPreset
	startDate?: string
}

export interface PerformancePeriods {
	comparison: PerformancePeriod
	current: PerformancePeriod
	isSingleDay: boolean
}

/* * */

function getReferenceOperationalDate(referenceDate: Date) {
	return formatOperationalDate(referenceDate);
}

/* * */

export function getCurrentPeriod(
	selection: PerformancePeriodSelection,
	referenceDate = new Date(),
): PerformancePeriod {
	const today = getReferenceOperationalDate(referenceDate);
	const todayDate = parseOperationalDate(today);
	const yesterday = formatOperationalDate(shiftOperationalDays(todayDate, -1));

	switch (selection.preset) {
		case 'custom':
			if (!selection.startDate || !selection.endDate) {
				return { endDate: yesterday, startDate: yesterday };
			}
			return { endDate: selection.endDate, startDate: selection.startDate };
		case 'last-7-days':
			return {
				endDate: today,
				startDate: formatOperationalDate(shiftOperationalDays(todayDate, -6)),
			};
		case 'month-to-date':
			return {
				endDate: today,
				startDate: formatOperationalDate(new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 12))),
			};
		case 'today':
			return { endDate: today, startDate: today };
		case 'yesterday':
			return { endDate: yesterday, startDate: yesterday };
	}
}

export function isSingleDayPeriod(period: PerformancePeriod) {
	return period.startDate === period.endDate;
}

/* * */
