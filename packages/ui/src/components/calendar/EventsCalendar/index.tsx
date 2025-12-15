'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';

import { ErrorDisplay } from '../../display/ErrorDisplay';
import { Section } from '../../layout/Section';
import { LoadingOverlay } from '../../loaders/LoadingOverlay';
import { Pane } from '../../panes/Pane';
import { Calendar } from '../Calendar';
import { useCalendarUIContext } from '../Calendar/index.context';
import { EventsCalendarProvider, useEventsCalendarContext } from './index.context';

/* * */

export interface EventsCalendarProps {
	onDateClick?: (date: Dates) => void
	onEventClick?: (eventId: string, eventType: 'annotation' | 'period') => void
}

/* * */

export function EventsCalendar({
	onDateClick,
	onEventClick,
}: EventsCalendarProps) {
	//

	return (
		<EventsCalendarProvider>
			<EventsCalendarContent
				onDateClick={onDateClick}
				onEventClick={onEventClick}
			/>
		</EventsCalendarProvider>
	);
}

/* * */

function EventsCalendarContent({
	onDateClick,
	onEventClick,
}: EventsCalendarProps) {
	//

	//
	// A. Setup variables

	const eventsContext = useEventsCalendarContext();
	const uiContext = useCalendarUIContext();

	//
	// B. Handle interactions

	const handleDayClick = (date: Dates) => {
		if (onDateClick) {
			onDateClick(date);
		}
	};

	const handleEventClick = (event: CalendarEvent) => {
		if (onEventClick && event.metadata) {
			const metadata = event.metadata as { data, type };
			onEventClick(event.id, metadata.type);
		}
	};

	//
	// C. Handle loading and error states

	if (eventsContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (eventsContext.flags.error) {
		return (
			<ErrorDisplay
				message="Failed to load calendar data"
			/>
		);
	}

	//
	// D. Render

	return (
		<Pane>
			<Section flexDirection="row" height="100%">
				<Calendar
					events={eventsContext.data.filteredEvents}
					onDayClick={handleDayClick}
					onEventClick={handleEventClick}
					showSidebar={true}
					eventTypes={[
						{
							checked: uiContext.state.eventTypeFilters.get('periods') !== false,
							color: 'var(--color-primary)',
							count: eventsContext.data.eventTypeCounts.periods,
							id: 'periods',
							label: 'Períodos',
						},
						{
							checked: uiContext.state.eventTypeFilters.get('annotations') !== false,
							color: '#f59e0b',
							count: eventsContext.data.eventTypeCounts.annotations,
							id: 'annotations',
							label: 'Anotações',
						},
					]}
				/>
			</Section>
		</Pane>
	);

	//
}
