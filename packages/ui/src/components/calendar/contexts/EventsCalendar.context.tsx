'use client';

/* * */

import { IconNote, TablerIcon } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { Agency, type Annotation, type CalendarEvent, type Period, PermissionCatalog } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useMeContext } from '../../../contexts/Me.context';
import { CalendarUIContextProvider } from './CalendarUI.context';

/* * */

interface EventsCalendarContextState {
	data: {
		annotations: Annotation[]
		events: CalendarEvent[]
		eventTypeCounts: {
			annotations: number
			periods: number
		}
		periods: Period[]
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

export const EventsCalendarProvider = ({ children }: PropsWithChildren) => {
	//

	return (
		<EventsCalendarDataProvider>
			{children}
		</EventsCalendarDataProvider>
	);
};

/* * */

const EventsCalendarDataProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const canReadPeriods = meContext.actions.hasPermission(
		PermissionCatalog.all.periods.scope,
		PermissionCatalog.all.periods.actions.read,
	);

	const canReadAnnotations = meContext.actions.hasPermission(
		PermissionCatalog.all.annotations.scope,
		PermissionCatalog.all.annotations.actions.read,
	);

	//
	// B. Fetch data

	const { data: periodsData, error: periodsError, isLoading: periodsLoading } = useSWR<Period[]>(
		canReadPeriods ? API_ROUTES.dates.PERIODS_LIST : null,
		{ refreshInterval: 10000 },
	);

	const { data: annotationsData, error: annotationsError, isLoading: annotationsLoading } = useSWR<Annotation[]>(
		canReadAnnotations ? API_ROUTES.dates.ANNOTATIONS_LIST : null,
		{ refreshInterval: 10000 },
	);

	const { data: agenciesData } = useSWR<Agency[], Error>(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Handle errors and loading states

	const hasError = periodsError || annotationsError;
	const isLoading = periodsLoading || annotationsLoading;

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
			}
			else {
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

		// Transform periods
		if (periodsData) {
			periodsData.forEach((period) => {
				if (period.dates && period.dates.length > 0) {
					// Create individual calendar events for each date
					period.dates.forEach((operationalDate) => {
						const date = Dates.fromOperationalDate(operationalDate, 'Europe/Lisbon');

						events.push({
							color: period.color || '#3b82f6',
							endDate: date.iso,
							id: `${period._id}-${operationalDate}`,
							metadata: {
								agency_name: agenciesData?.find(agency => agency._id === period.agency_id)?.name ?? '',
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

		// Transform annotations
		if (annotationsData) {
			annotationsData.forEach((annotation) => {
				if (annotation.dates && annotation.dates.length > 0) {
					// Group dates into consecutive ranges
					const dateRanges = groupConsecutiveDates(annotation.dates);

					// Create a separate calendar event for each consecutive range
					dateRanges.forEach((range) => {
						const startDate = Dates.fromOperationalDate(range[0], 'Europe/Lisbon');
						const endDate = range.length > 1
							? Dates.fromOperationalDate(range[range.length - 1], 'Europe/Lisbon')
							: undefined;

						events.push({
							color: '#f59e0b',
							description: annotation.description,
							endDate: endDate?.iso,
							icon: IconNote as unknown as TablerIcon,
							id: annotation._id,
							startDate: startDate.iso,
							title: annotation.title,
						});
					});
				}
			});
		}

		return events;
	}, [periodsData, annotationsData, agenciesData]);

	//
	// E. Count events by type

	const eventTypeCounts = useMemo(() => {
		const periods = periodsData?.length || 0;
		const annotations = annotationsData?.length || 0;
		return { annotations, periods };
	}, [periodsData, annotationsData]);

	//
	// F. Context value

	const contextValue: EventsCalendarContextState = useMemo(() => ({
		data: {
			annotations: annotationsData || [],
			events: calendarEvents,
			eventTypeCounts,
			periods: periodsData || [],
		},
		flags: {
			error: hasError || null,
			loading: isLoading,
		},
	}), [annotationsData, calendarEvents, eventTypeCounts, hasError, isLoading, periodsData]);

	//
	// G. Render

	return (
		<CalendarUIContextProvider
			events={calendarEvents}
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
