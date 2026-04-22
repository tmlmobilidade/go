'use client';

/* * */

import { type CalendarEvent } from '@tmlmobilidade/types';
import { EventsCalendar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export interface RulePreviewCalendarProps {
	/**
	 * Array of ISO dates (YYYY-MM-DD format) that will be affected by the rule
	 */
	affectedDates: string[]
	onVisibleYearChange?: (year: number) => void
}

/* * */

export function RulePreviewCalendar({ affectedDates, onVisibleYearChange }: RulePreviewCalendarProps) {
	//

	//
	// A. Transform dates into calendar events

	const ruleImpactEvents = useMemo(() => {
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
	// B. Render calendar with periods, annotations, and rule impacts

	return (
		<EventsCalendar
			additionalEvents={ruleImpactEvents}
			initialView="year"
			onYearChange={onVisibleYearChange}
			showSidebar={false}
		/>
	);

	//
}
