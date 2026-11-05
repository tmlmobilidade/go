import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';

/* * */

export function getPeriodsDateCoverage({ agencyIds, periods, previewDates, year }: { agencyIds: string[], periods: Partial<Pick<YearPeriod, 'agency_ids' | 'dates'>>[], previewDates: CalendarDate[], year: number }) {
	const coverage = new Map(agencyIds.map(id => [id, new Set<string>(previewDates)]));
	for (const period of periods) {
		for (const agencyId of period.agency_ids?.length ? period.agency_ids : agencyIds) {
			const dates = coverage.get(agencyId);
			if (!dates) continue;
			for (const date of period.dates ?? []) dates.add(toCalendarDate(date));
		}
	}

	const missingDates: CalendarDate[] = [];
	const ranges: { end: CalendarDate, start: CalendarDate }[] = [];
	const cursor = new Date(`${year}-01-01T00:00:00Z`);
	let previousWasMissing = false;
	while (cursor.getUTCFullYear() === year) {
		const date = toCalendarDate(cursor.toISOString().slice(0, 10));
		const isMissing = Array.from(coverage.values()).some(dates => !dates.has(date));
		if (isMissing) {
			missingDates.push(date);
			if (previousWasMissing) ranges[ranges.length - 1].end = date;
			else ranges.push({ end: date, start: date });
		}
		previousWasMissing = isMissing;
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}

	return { missingDates, ranges };
}
