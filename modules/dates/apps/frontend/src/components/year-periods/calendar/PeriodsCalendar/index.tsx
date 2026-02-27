'use client';

/* * */

import { openAsignPeriodModal } from '@/components/year-periods/calendar/PeriodAssign.modal';
import { CalendarKey } from '@tmlmobilidade/dates';
import { EventsCalendar } from '@tmlmobilidade/ui';

/* * */

export function PeriodsCalendar() {
	//

	//
	// A. Handle range selection

	const handleRangeSelect = (range: { end: CalendarKey, start: CalendarKey }, clearSelection: () => void) => {
		openAsignPeriodModal(range, clearSelection);
	};

	//
	// B. Render component

	return (
		<EventsCalendar
			initialView="year"
			onRangeSelect={handleRangeSelect}
			showSidebar={false}
		/>
	);

	//
}
