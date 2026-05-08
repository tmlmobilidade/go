'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Agency, type Annotation, type CalendarEvent, Event, Holiday, PermissionCatalog, type YearPeriod } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useMeContext } from '../../../contexts/Me.context';
import { EVENT_TYPE_DEFS } from '../../../icons/event-types';
import { CalendarUIContextProvider } from './CalendarUI.context';

/* * */

interface EventsCalendarContextState {
	data: {
		annotations: Annotation[]
		calendarEvents: CalendarEvent[]
		eventTypeCounts: {
			additional: number
			annotations: number
			events: number
			holidays: number
			yearPeriods: number
		}
		holidays: Holiday[]
		yearPeriods: YearPeriod[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const EventsCalendarContext = createContext<EventsCalendarContextState | undefined>(undefined);

export const useEventsCalendarContext = () => {
	const context = useContext(EventsCalendarContext);
	if (!context) {
		throw new Error('useEventsCalendarContext must be used within an EventsCalendarProvider');
	}
	return context;
};

/* * */

export const EventsCalendarProvider = ({ additionalEvents = [], children }: PropsWithChildren<{ additionalEvents?: CalendarEvent[] }>) => {
	//

	return (
		<EventsCalendarDataProvider additionalEvents={additionalEvents}>
			{children}
		</EventsCalendarDataProvider>
	);
};

/* * */

const EventsCalendarDataProvider = ({ additionalEvents = [], children }: PropsWithChildren<{ additionalEvents?: CalendarEvent[] }>) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const canReadYearPeriods = meContext.actions.hasPermission(
		PermissionCatalog.all.year_periods.scope,
		PermissionCatalog.all.year_periods.actions.read,
	);

	const canReadAnnotations = meContext.actions.hasPermission(
		PermissionCatalog.all.annotations.scope,
		PermissionCatalog.all.annotations.actions.read,
	);

	const canReadHolidays = meContext.actions.hasPermission(
		PermissionCatalog.all.holidays.scope,
		PermissionCatalog.all.holidays.actions.read,
	);

	const canReadEvents = meContext.actions.hasPermission(
		PermissionCatalog.all.events.scope,
		PermissionCatalog.all.events.actions.read,
	);

	//
	// B. Fetch data

	const { data: yearPeriodsData, error: yearPeriodsError, isLoading: yearPeriodsLoading } = useSWR<YearPeriod[]>(
		canReadYearPeriods ? API_ROUTES.dates.YEAR_PERIODS_LIST : null);

	const { data: annotationsData, error: annotationsError, isLoading: annotationsLoading } = useSWR<Annotation[]>(
		canReadAnnotations ? API_ROUTES.dates.ANNOTATIONS_LIST : null,
	);

	const { data: holidaysData, error: holidaysError, isLoading: holidaysLoading } = useSWR<Holiday[]>(
		canReadHolidays ? API_ROUTES.dates.HOLIDAYS_LIST : null,
	);

	const { data: eventsData, error: eventsError, isLoading: eventsLoading } = useSWR<Event[]>(
		canReadEvents ? API_ROUTES.dates.EVENTS_LIST : null,
	);

	const { data: agenciesData } = useSWR<Agency[], Error>(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Handle errors and loading states

	const hasError = yearPeriodsError || annotationsError || holidaysError || eventsError || null;
	const isLoading = yearPeriodsLoading || annotationsLoading || holidaysLoading || eventsLoading;

	//
	// D. Transform data

	// Helper function to group consecutive dates into ranges
	const groupConsecutiveDates = (dates: string[]): string[][] => {
		if (dates.length === 0) return [];

		const sortedDates = [...dates].sort();
		const ranges: string[][] = [];
		let currentRange: string[] = [sortedDates[0]];

		for (let i = 1; i < sortedDates.length; i++) {
			const prevDate = Dates.fromOperationalDate(sortedDates[i - 1], 'Europe/Lisbon');
			const currDate = Dates.fromOperationalDate(sortedDates[i], 'Europe/Lisbon');

			// Check if dates are consecutive (1 day apart)
			const daysDiff = Math.round((currDate.unix_timestamp - prevDate.unix_timestamp) / (1000 * 60 * 60 * 24));

			if (daysDiff === 1) {
				// Dates are consecutive, add to current range
				currentRange.push(sortedDates[i]);
			} else {
				// Gap detected, start a new range
				ranges.push(currentRange);
				currentRange = [sortedDates[i]];
			}
		}

		// Don't forget the last range
		ranges.push(currentRange);

		return ranges;
	};

	const calendarEvents = useMemo(() => {
		const events: CalendarEvent[] = [];

		// Transform year periods
		if (yearPeriodsData) {
			yearPeriodsData.forEach((period) => {
				if (period.dates && period.dates.length > 0) {
					// Create individual calendar events for each date
					period.dates.forEach((operationalDate) => {
						const date = Dates.fromOperationalDate(operationalDate, 'Europe/Lisbon');
						const agenciesNames = agenciesData
							?.filter(agency => period.agency_ids?.includes(agency._id))
							.map(agency => agency.short_name || agency.name)
							.join(', ');

						events.push({
							color: period.color || '#3b82f6',
							endDate: date.iso,
							id: `${period._id}-${operationalDate}`,
							metadata: {
								agency_ids: period.agency_ids,
								agency_names: agenciesNames,
								period_id: period._id,
							},
							startDate: date.iso,
							title: period.name,
							type: 'period',
						});
					});
				}
			});
		}

		// Helper to transform grouped date data into calendar events
		function pushGroupedEvents<T extends { _id: string, dates: string[], description?: string, title: string }>(
			items: T[] | undefined,
			type: 'annotation' | 'event' | 'holiday',
			events: CalendarEvent[],
		) {
			if (!items) return;
			items.forEach((item) => {
				if (item.dates && item.dates.length > 0) {
					const dateRanges = groupConsecutiveDates(item.dates);
					dateRanges.forEach((range) => {
						const startDate = Dates.fromOperationalDate(range[0], 'Europe/Lisbon');
						const endDate = range.length > 1
							? Dates.fromOperationalDate(range[range.length - 1], 'Europe/Lisbon')
							: undefined;
						events.push({
							color: EVENT_TYPE_DEFS[type].color,
							description: item.description,
							endDate: endDate?.iso,
							icon: EVENT_TYPE_DEFS[type].icon,
							id: `${item._id}`,
							startDate: startDate.iso,
							title: item.title,
							type,
						});
					});
				}
			});
		}

		// Transform annotations, holidays, and events
		pushGroupedEvents(annotationsData, 'annotation', events);
		pushGroupedEvents(holidaysData, 'holiday', events);
		pushGroupedEvents(eventsData, 'event', events);

		return events;
	}, [yearPeriodsData, annotationsData, agenciesData, holidaysData, eventsData]);

	// Merge with additional events
	const allEvents = useMemo(() => {
		return [...calendarEvents, ...additionalEvents];
	}, [calendarEvents, additionalEvents]);

	//
	// E. Count events by type

	const eventTypeCounts = useMemo(() => {
		const yearPeriods = yearPeriodsData?.length || 0;
		const annotations = annotationsData?.length || 0;
		const holidays = holidaysData?.length || 0;
		const additional = additionalEvents.length;
		const events = eventsData?.length || 0;
		return { additional, annotations, events, holidays, yearPeriods };
	}, [yearPeriodsData, annotationsData, holidaysData, additionalEvents, eventsData]);

	//
	// F. Context value

	const contextValue: EventsCalendarContextState = useMemo(() => ({
		data: {
			annotations: annotationsData || [],
			calendarEvents: allEvents,
			events: eventsData || [],
			eventTypeCounts,
			holidays: holidaysData || [],
			yearPeriods: yearPeriodsData || [],
		},
		flags: {
			error: hasError || null,
			loading: isLoading,
		},
	}), [annotationsData, allEvents, eventsData, eventTypeCounts, holidaysData, yearPeriodsData, hasError, isLoading]);

	//
	// G. Render

	return (
		<CalendarUIContextProvider
			events={allEvents}
			showSidebar={true}
			initialEventTypeFilters={{
				event: true,
				period: true,
			}}
		>
			<EventsCalendarContext.Provider value={contextValue}>
				{children}
			</EventsCalendarContext.Provider>
		</CalendarUIContextProvider>
	);

	//
};
