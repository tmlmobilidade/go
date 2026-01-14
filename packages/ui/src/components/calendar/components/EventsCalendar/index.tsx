'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent, CalendarEventType } from '@tmlmobilidade/types';
import { useRouter } from 'next/navigation';

import { ErrorDisplay } from '../../../display/ErrorDisplay';
import { LoadingOverlay } from '../../../loaders/LoadingOverlay';
import { useCalendarUIContext } from '../../contexts/CalendarUI.context';
import { EventsCalendarProvider, useEventsCalendarContext } from '../../contexts/EventsCalendar.context';
import { Calendar } from '../Calendar';

/* * */

export interface EventsCalendarProps {
	initialView?: 'month' | 'year'
	onDayClick?: (date: Dates) => void
	onEventClick?: (eventId: string, eventType: CalendarEventType) => void
	onRangeSelect?: (range: { end: Dates, start: Dates }, clearSelection: () => void) => void
	showSidebar?: boolean
}

/* * */

export function EventsCalendar({
	initialView = 'month',
	onDayClick,
	onEventClick,
	onRangeSelect,
	showSidebar = true,
}: EventsCalendarProps) {
	//

	return (
		<EventsCalendarProvider>
			<EventsCalendarContent
				initialView={initialView}
				onDayClick={onDayClick}
				onEventClick={onEventClick}
				onRangeSelect={onRangeSelect}
				showSidebar={showSidebar}
			/>
		</EventsCalendarProvider>
	);
}

/* * */

function EventsCalendarContent({
	initialView,
	onDayClick,
	onEventClick,
	onRangeSelect,
	showSidebar,
}: EventsCalendarProps) {
	//

	//
	// A. Setup variables

	const eventsContext = useEventsCalendarContext();
	const uiContext = useCalendarUIContext();
	const router = useRouter();

	//
	// B. Handle interactions

	const handleEventClick = (event: CalendarEvent) => {
		if (onEventClick) {
			onEventClick(event.id, event.type);
		}
		if (event.type === 'annotation') {
			router.push(PAGE_ROUTES.dates.ANNOTATIONS_DETAIL(event.id));
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
		<Calendar
			initialView={initialView}
			onDayClick={onDayClick}
			onEventClick={handleEventClick}
			onRangeSelect={onRangeSelect}
			showSidebar={showSidebar}
			eventTypes={[
				{
					checked: uiContext.state.eventTypeFilters.get('period') !== false,
					color: 'var(--color-primary)',
					count: eventsContext.data.eventTypeCounts.periods,
					id: 'period',
					label: 'Períodos',
				},
				{
					checked: uiContext.state.eventTypeFilters.get('annotation') !== false,
					color: '#f59e0b',
					count: eventsContext.data.eventTypeCounts.annotations,
					id: 'annotation',
					label: 'Anotações',
				},
			]}
		/>
	);

	//
}
