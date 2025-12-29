'use client';

/* * */

import { openAsignPeriodModal } from '@/components/periods/calendar/PeriodAssign.modal';
import { Dates } from '@tmlmobilidade/dates';
import { EventsCalendar } from '@tmlmobilidade/ui';

/* * */

export function PeriodsCalendar() {
	//

	//
	// A. Handle range selection

	const handleRangeSelect = (range: { end: Dates, start: Dates }, clearSelection: () => void) => {
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
