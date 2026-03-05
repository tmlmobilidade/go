'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CalendarKey, Dates } from '@tmlmobilidade/dates';
import { type CalendarEvent, CalendarEventType } from '@tmlmobilidade/types';
import { useRouter } from 'next/navigation';

import { EVENT_TYPE_DEFS } from '../../../../icons/event-types';
import { ErrorDisplay } from '../../../display/ErrorDisplay';
import { LoadingOverlay } from '../../../loaders/LoadingOverlay';
import { useCalendarUIContext } from '../../contexts/CalendarUI.context';
import { EventsCalendarProvider, useEventsCalendarContext } from '../../contexts/EventsCalendar.context';
import { Calendar } from '../Calendar';

/* * */

export interface EventsCalendarProps {
	additionalEvents?: CalendarEvent[]
	initialView?: 'month' | 'year'
	onDayClick?: (date: Dates) => void
	onEventClick?: (eventId: string, eventType: CalendarEventType) => void
	onRangeSelect?: (range: { end: CalendarKey, start: CalendarKey }, clearSelection: () => void) => void
	showSidebar?: boolean
}

/* * */

export function EventsCalendar({
	additionalEvents = [],
	initialView = 'month',
	onDayClick,
	onEventClick,
	onRangeSelect,
	showSidebar = true,
}: EventsCalendarProps) {
	//

	return (
		<EventsCalendarProvider additionalEvents={additionalEvents}>
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
		if (event.type === 'holiday') {
			router.push(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(event.id));
		}
		if (event.type === 'event') {
			router.push(PAGE_ROUTES.dates.EVENTS_DETAIL(event.id));
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
					color: EVENT_TYPE_DEFS['period'].color,
					count: eventsContext.data.eventTypeCounts.yearPeriods,
					id: 'period',
					label: 'Períodos',
				},
				{
					checked: uiContext.state.eventTypeFilters.get('annotation') !== false,
					color: EVENT_TYPE_DEFS['annotation'].color,
					count: eventsContext.data.eventTypeCounts.annotations,
					id: 'annotation',
					label: 'Anotações',
				},
				{
					checked: uiContext.state.eventTypeFilters.get('holiday') !== false,
					color: EVENT_TYPE_DEFS['holiday'].color,
					count: eventsContext.data.eventTypeCounts.holidays,
					id: 'holiday',
					label: 'Feriados',
				},
				{
					checked: uiContext.state.eventTypeFilters.get('event') !== false,
					color: EVENT_TYPE_DEFS['event'].color,
					count: eventsContext.data.eventTypeCounts.events,
					id: 'event',
					label: 'Eventos',
				},
				...(eventsContext.data.eventTypeCounts.additional > 0 ? [{
					checked: uiContext.state.eventTypeFilters.get('event') !== false,
					color: EVENT_TYPE_DEFS['event'].color,
					count: eventsContext.data.eventTypeCounts.additional,
					id: 'event' as CalendarEventType,
					label: 'Dias afetados',
				}] : []),
			]}
		/>
	);

	//
}
