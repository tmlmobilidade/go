'use client';

import { PeriodsCalendarHeader } from '@/components/year-periods/calendar/PeriodsCalendarHeader';

import { usePeriodDatesEditorContext } from '../PeriodDatesEditor.context';

/* * */

export function PeriodDatesEditorCalendarHeader() {
	//

	//
	// A. Setup variables

	const { actions, data } = usePeriodDatesEditorContext();

	//
	// B. Render components

	return (
		<PeriodsCalendarHeader
			agencyIds={data.calendarAgencyIds}
			date={data.visibleDate}
			onDateChange={actions.setVisibleDate}
			periods={data.sources.yearPeriods ?? []}
			previewDates={data.previewDates}
		/>
	);
}
