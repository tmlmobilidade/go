'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';

import { ErrorDisplay } from '../../display/ErrorDisplay';
import { Section } from '../../layout/Section';
import { LoadingOverlay } from '../../loaders/LoadingOverlay';
import { Pane } from '../../panes/Pane';
import { Calendar } from '../Calendar';
import { useCalendarUIContext } from '../Calendar/index.context';
import { useEventsCalendarContext } from './index.context';

/* * */

export interface EventsCalendarProps {
	onDayClick?: (date: Dates) => void
	onEventClick?: (eventId: string, eventType: 'annotation' | 'period') => void
}

/* * */

export function EventsCalendar({
	onDayClick,
	onEventClick,
}: EventsCalendarProps) {
	//

	//
	// A. Setup variables

	const eventsContext = useEventsCalendarContext();
	const uiContext = useCalendarUIContext();

	//
	// B. Handle interactions

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
					onDayClick={onDayClick}
					onEventClick={handleEventClick}
					showSidebar={true}
					eventTypes={[
						{
							checked: uiContext.state.eventTypeFilters.get('period') !== false,
							color: 'var(--color-primary)',
							count: eventsContext.data.eventTypeCounts.periods,
							id: 'period',
							label: 'Períodos',
						},
						{
							checked: uiContext.state.eventTypeFilters.get('event') !== false,
							color: '#f59e0b',
							count: eventsContext.data.eventTypeCounts.annotations,
							id: 'event',
							label: 'Anotações',
						},
					]}
				/>
			</Section>
		</Pane>
	);

	//
}
