import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type CalendarDate, toCalendarDate } from '@tmlmobilidade/go-types-shared';

/* * */

/** A date can belong to different periods for different operators. Keep every owner. */
export function getPeriodsCalendarDays(periods: YearPeriod[], agencyIds: string[], selectedPeriodId?: string, previewDates?: CalendarDate[]) {
	const scope = new Set(agencyIds);
	const days = new Map<CalendarDate, YearPeriod[]>();
	const relevantPeriods = periods.filter(period => period.agency_ids.some(id => scope.has(id)));
	const selected = relevantPeriods.find(period => period._id === selectedPeriodId);
	const preview = previewDates && new Set(previewDates);
	for (const period of relevantPeriods) {
		const dates = period._id === selectedPeriodId && previewDates ? previewDates : (period.dates ?? []).map(toCalendarDate);
		for (const date of new Set(dates)) {
			// The selected draft takes ownership after the existing conflict review is accepted.
			if (period._id !== selectedPeriodId && preview?.has(date) && selected && period.agency_ids.filter(id => scope.has(id)).every(id => selected.agency_ids.includes(id))) continue;
			const owners = days.get(date) ?? [];
			owners.push(period);
			days.set(date, owners);
		}
	}
	return days;
}
