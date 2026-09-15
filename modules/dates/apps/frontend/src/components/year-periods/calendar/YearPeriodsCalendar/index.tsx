'use client';

import { openYearPeriodsAssignModal } from '@/components/year-periods/calendar/YearPeriodsAssign.modal';
import { type YearPeriodsAssignDateRange } from '@/components/year-periods/calendar/YearPeriodsAssignForm.context';
import { EventsCalendar, EventsCalendarProvider } from '@tmlmobilidade/ui';

/* * */

export function YearPeriodsCalendar() {
	//

	//
	// A. Handle actions

	const handleRangeSelect = (range: YearPeriodsAssignDateRange, clearSelection: () => void) => {
		openYearPeriodsAssignModal(range, clearSelection);
	};

	//
	// B. Render components

	return (
		<EventsCalendarProvider>
			<EventsCalendar
				initialView="year"
				onRangeSelect={handleRangeSelect}
				showSidebar={false}
			/>
		</EventsCalendarProvider>
	);
}
