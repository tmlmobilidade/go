import { UpdateYearPeriodDatesSchema, type UpdateYearPeriodDto, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type CalendarDate, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';

/* * */

export function getPeriodsDetailUpdate(values: UpdateYearPeriodDto, addedDates: CalendarDate[], removedDates: CalendarDate[]) {
	return UpdateYearPeriodDatesSchema.parse({
		add_dates: addedDates.map(date => date.replaceAll('-', '')),
		period: values,
		remove_dates: removedDates.map(date => date.replaceAll('-', '')),
	});
}

/** Match the API: changing operators reassigns all remaining dates; otherwise review only additions. */
export function getPeriodsDetailReviewRequest(period: undefined | YearPeriod, agencyIds: string[], addedDates: CalendarDate[], previewDates: CalendarDate[]) {
	if (!period || !agencyIds.length) return null;
	const agenciesChanged = agencyIds.length !== period.agency_ids.length || !period.agency_ids.every(id => agencyIds.includes(id));
	const dates = (agenciesChanged ? previewDates : addedDates).map(date => OperationalDateIntSchema.parse(date.replaceAll('-', '')));
	return dates.length ? { agency_ids: [...agencyIds].sort(), dates, year_period_id: period._id } : null;
}
