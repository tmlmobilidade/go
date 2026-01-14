'use client';

/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';
import { Calendar, CalendarUIContextProvider } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export interface RulePreviewCalendarProps {
	/**
	 * Array of ISO dates (YYYY-MM-DD format) that will be affected by the rule
	 */
	affectedDates: string[]
}

/* * */

// Change this to include events calendar (only holidays, periods, events)

export function RulePreviewCalendar({ affectedDates }: RulePreviewCalendarProps) {
	//

	//
	// A. Transform dates into calendar events

	const calendarEvents = useMemo(() => {
		// Filter out invalid dates and transform to calendar events
		const events: CalendarEvent[] = affectedDates
			.filter(isoDate => isoDate && typeof isoDate === 'string')
			.map((isoDate) => {
				return {
					color: 'var(--color-primary)',
					display: 'cell' as const,
					endDate: isoDate,
					id: isoDate,
					startDate: isoDate,
					title: 'Dia afetado pela regra',
					type: 'event' as const,
				};
			});

		return events;
	}, [affectedDates]);

	//
	// B. Render calendar with context provider

	return (
		<CalendarUIContextProvider
			events={calendarEvents}
			showSidebar={false}
			initialEventTypeFilters={{
				event: true,
			}}
		>
			<Calendar
				initialView="year"
				showSidebar={false}
				eventTypes={[
					{
						checked: true,
						color: 'var(--color-primary)',
						count: calendarEvents.length,
						id: 'event',
						label: 'Dias afetados',
					},
				]}
			/>
		</CalendarUIContextProvider>
	);

	//
}
