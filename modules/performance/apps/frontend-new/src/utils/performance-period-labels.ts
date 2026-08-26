/* * */

import { parseOperationalDate, shiftOperationalDays } from '@/utils/operational-dates';
import { getComparisonPeriod } from '@/utils/performance-comparisons';
import { getCurrentPeriod, type PerformanceComparison, type PerformancePeriod, type PerformancePeriodSelection } from '@/utils/performance-periods';

/* * */

export function formatPeriodRangeLabel(period: PerformancePeriod, locale = 'pt-PT'): string {
	const start = parseOperationalDate(period.startDate);
	const end = parseOperationalDate(period.endDate);
	const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });

	if (period.startDate === period.endDate) return formatter.format(start);

	const startWithoutYear = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(start);
	const endWithYear = formatter.format(end);
	return `${startWithoutYear}–${endWithYear}`;
}

export function getComparisonContextLabel(
	selection: PerformancePeriodSelection,
	comparison: PerformanceComparison,
	locale = 'pt-PT',
	referenceDate = new Date(),
): string {
	const current = getCurrentPeriod(selection, referenceDate);

	if (comparison === 'comparable-weekdays') {
		const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
		const currentDate = parseOperationalDate(current.startDate);
		return Array.from({ length: 8 }, (_, index) => formatter.format(shiftOperationalDays(currentDate, -(index + 1) * 7))).join(', ');
	}

	return formatPeriodRangeLabel(getComparisonPeriod(current, comparison), locale);
}

export function getComparisonLabelKey(comparison: PerformanceComparison) {
	switch (comparison) {
		case 'comparable-weekdays':
			return 'filters.comparison.equivalentDays';
		case 'previous-period':
			return 'filters.comparison.previousPeriod';
		case 'previous-week':
			return 'filters.comparison.previousWeek';
		case 'same-period-last-month':
			return 'filters.comparison.samePeriodLastMonth';
	}
}

export function getComparisonDescriptionKey(comparison: PerformanceComparison) {
	switch (comparison) {
		case 'comparable-weekdays':
			return 'filters.comparison.equivalentDescription';
		case 'previous-period':
			return 'filters.comparison.previousPeriodDescription';
		case 'previous-week':
			return 'filters.comparison.previousWeekDescription';
		case 'same-period-last-month':
			return 'filters.comparison.samePeriodLastMonthDescription';
	}
}

export function formatOverTimePeriodLabel(period: number, timeGrain: 'day' | 'hour', locale = 'pt-PT') {
	if (timeGrain === 'hour') {
		return new Intl.DateTimeFormat(locale, {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/Lisbon',
		}).format(new Date(period));
	}

	const value = String(period).padStart(8, '0');
	const date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00Z`);
	return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

export function formatOverTimePeriodTooltipLabel(
	period: number,
	timeGrain: 'day' | 'hour',
	locale = 'pt-PT',
	periodEnd?: number,
) {
	const parsePeriod = (value: number) => {
		if (timeGrain === 'hour') return new Date(value);

		const operationalDate = String(value).padStart(8, '0');
		return new Date(`${operationalDate.slice(0, 4)}-${operationalDate.slice(4, 6)}-${operationalDate.slice(6, 8)}T12:00:00Z`);
	};
	const formatter = new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		hour: timeGrain === 'hour' ? '2-digit' : undefined,
		minute: timeGrain === 'hour' ? '2-digit' : undefined,
		month: 'long',
		timeZone: 'Europe/Lisbon',
		weekday: 'long',
		year: 'numeric',
	});
	const capitalize = (value: string) => `${value.charAt(0).toLocaleUpperCase(locale)}${value.slice(1)}`;
	const start = capitalize(formatter.format(parsePeriod(period)));

	if (!periodEnd) return start;
	return `${start} – ${capitalize(formatter.format(parsePeriod(periodEnd)))}`;
}
