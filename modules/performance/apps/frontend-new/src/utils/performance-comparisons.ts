/* * */

import { formatOperationalDate, getInclusiveOperationalDayCount, parseOperationalDate, shiftOperationalDays, shiftOperationalMonthsClamped } from '@/utils/operational-dates';
import { getCurrentPeriod, isSingleDayPeriod, type PerformanceComparison, type PerformancePeriod, type PerformancePeriods, type PerformancePeriodSelection, type PerformanceScreen } from '@/utils/performance-periods';

/* * */

export interface ComparisonAvailabilityOptions {
	allowComparableWeekdays?: boolean
}

/* * */

export function isClosedSingleDayPeriod(period: PerformancePeriod, referenceDate = new Date()) {
	const today = formatOperationalDate(referenceDate);
	return isSingleDayPeriod(period) && period.startDate !== today;
}

export function getAvailableComparisons(
	selection: PerformancePeriodSelection,
	screen: PerformanceScreen,
	referenceDate = new Date(),
	options: ComparisonAvailabilityOptions = {},
): PerformanceComparison[] {
	if (screen === 'pulse') return ['comparable-weekdays'];

	const current = getCurrentPeriod(selection, referenceDate);
	const comparisons: PerformanceComparison[] = [];

	if (options.allowComparableWeekdays && isClosedSingleDayPeriod(current, referenceDate)) {
		comparisons.push('comparable-weekdays');
	}

	comparisons.push('previous-period', 'same-period-last-month');
	if (isSingleDayPeriod(current)) comparisons.push('previous-week');
	return comparisons;
}

export function normalizeComparison(
	selection: PerformancePeriodSelection,
	comparison: PerformanceComparison,
	screen: PerformanceScreen,
	referenceDate = new Date(),
	options: ComparisonAvailabilityOptions = {},
): PerformanceComparison {
	const available = getAvailableComparisons(selection, screen, referenceDate, options);
	return available.includes(comparison) ? comparison : available[0] ?? 'previous-period';
}

export function getComparisonPeriod(
	current: PerformancePeriod,
	comparison: Exclude<PerformanceComparison, 'comparable-weekdays'>,
): PerformancePeriod {
	const start = parseOperationalDate(current.startDate);
	const end = parseOperationalDate(current.endDate);
	const dayCount = getInclusiveOperationalDayCount(current.startDate, current.endDate);

	if (comparison === 'previous-week') {
		const shiftedDate = formatOperationalDate(shiftOperationalDays(start, -7));
		return { endDate: shiftedDate, startDate: shiftedDate };
	}

	if (comparison === 'same-period-last-month') {
		return {
			endDate: formatOperationalDate(shiftOperationalMonthsClamped(end, -1)),
			startDate: formatOperationalDate(shiftOperationalMonthsClamped(start, -1)),
		};
	}

	const comparisonEnd = shiftOperationalDays(start, -1);
	const comparisonStart = shiftOperationalDays(comparisonEnd, -(dayCount - 1));
	return {
		endDate: formatOperationalDate(comparisonEnd),
		startDate: formatOperationalDate(comparisonStart),
	};
}

export function getPerformancePeriods(
	selection: PerformancePeriodSelection,
	comparison: PerformanceComparison,
	referenceDate = new Date(),
): PerformancePeriods {
	const current = getCurrentPeriod(selection, referenceDate);
	if (comparison === 'comparable-weekdays') {
		return { comparison: current, current, isSingleDay: isSingleDayPeriod(current) };
	}

	return {
		comparison: getComparisonPeriod(current, comparison),
		current,
		isSingleDay: isSingleDayPeriod(current),
	};
}
