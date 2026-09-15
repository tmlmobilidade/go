'use client';

import { EventsCalendar, EventsCalendarProvider, Pane, Section } from '@tmlmobilidade/ui';

/* * */

export function CalendarView() {
	return (
		<EventsCalendarProvider>
			<Pane>
				<Section flexDirection="row" height="100%">
					<EventsCalendar />
				</Section>
			</Pane>
		</EventsCalendarProvider>
	);
}
