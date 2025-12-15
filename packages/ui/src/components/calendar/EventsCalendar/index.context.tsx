'use client';

/* * */

import { IconNote } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Annotation, type CalendarEvent, type Period } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useToast } from '../../../hooks';
import { CalendarUIContextProvider, useCalendarUIContext } from '../Calendar/index.context';

/* * */

interface EventsCalendarContextState {
	actions: {
		addDatesToPeriod: (periodId: string, dates: string[]) => Promise<void>
	}
	data: {
		annotations: Annotation[]
		events: CalendarEvent[]
		eventTypeCounts: {
			annotations: number
			periods: number
		}
		filteredEvents: CalendarEvent[]
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
		<CalendarUIContextProvider
			showSidebar={true}
			initialEventTypeFilters={{
				annotations: true,
				periods: true,
			}}
		>
			<EventsCalendarDataProvider>
				{children}
			</EventsCalendarDataProvider>
		</CalendarUIContextProvider>
	);
};

/* * */

const EventsCalendarDataProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: periodsData, error: periodsError, isLoading: periodsLoading, mutate: mutatePeriods } = useSWR<Period[]>(
		API_ROUTES.dates.PERIODS_LIST,
		{ refreshInterval: 10000 },
	);

	const { data: annotationsData, error: annotationsError, isLoading: annotationsLoading } = useSWR<Annotation[]>(
		API_ROUTES.dates.ANNOTATIONS_LIST,
		{ refreshInterval: 10000 },
	);

	const uiContext = useCalendarUIContext();

	//
	// B. Handle errors and loading states

	const hasError = periodsError || annotationsError;
	const isLoading = periodsLoading || annotationsLoading;

	//
	// C. Transform data to calendar events

	const calendarEvents = useMemo(() => {
		const events: CalendarEvent[] = [];

		// Transform periods
		if (periodsData) {
			periodsData.forEach((period) => {
				if (period.dates && period.dates.length > 0) {
					const sortedDates = [...period.dates].sort();
					const startDate = Dates.fromOperationalDate(sortedDates[0], 'Europe/Lisbon');
					const endDate = sortedDates.length > 1
						? Dates.fromOperationalDate(sortedDates[sortedDates.length - 1], 'Europe/Lisbon')
						: undefined;

					events.push({
						color: period.color || '#3b82f6',
						endDate: endDate?.iso,
						id: period._id,
						metadata: {
							agency_id: period.agency_id,
							type: 'period',
						},
						startDate: startDate?.iso,
						title: period.name,
						type: 'period',
					});
				}
			});
		}

		// Transform annotations
		if (annotationsData) {
			annotationsData.forEach((annotation) => {
				if (annotation.dates && annotation.dates.length > 0) {
					const sortedDates = [...annotation.dates].sort();
					const startDate = Dates.fromOperationalDate(sortedDates[0], 'Europe/Lisbon');
					const endDate = sortedDates.length > 1
						? Dates.fromOperationalDate(sortedDates[sortedDates.length - 1], 'Europe/Lisbon')
						: undefined;

					events.push({
						color: '#f59e0b',
						description: annotation.description,
						endDate: endDate?.iso,
						icon: IconNote,
						id: annotation._id,
						metadata: {
							type: 'annotation',
						},
						startDate: startDate.iso,
						title: annotation.title,
						type: 'event',
					});
				}
			});
		}

		return events;
	}, [periodsData, annotationsData]);

	//
	// D. Filter events based on UI context

	const filteredEvents = useMemo(() => {
		return calendarEvents.filter((event) => {
			if (event.type === 'period') {
				return uiContext.state.eventTypeFilters.get('periods') !== false;
			}
			if (event.type === 'event') {
				return uiContext.state.eventTypeFilters.get('annotations') !== false;
			}
			return true;
		});
	}, [calendarEvents, uiContext.state.eventTypeFilters]);

	//
	// E. Count events by type

	const eventTypeCounts = useMemo(() => {
		const periods = calendarEvents.filter(e => e.type === 'period').length;
		const annotations = calendarEvents.filter(e => e.type === 'event').length;
		return { annotations, periods };
	}, [calendarEvents]);

	//
	// F. Handle actions

	const addDatesToPeriod = async (periodId: string, dates: string[]) => {
		const toastId = useToast.loading({
			message: 'Adding dates to period...',
			title: 'Updating period',
		});

		try {
			// Find the current period
			const period = periodsData?.find(p => p._id === periodId);
			if (!period) {
				throw new Error('Period not found');
			}

			// Merge new dates with existing dates, avoiding duplicates
			const existingDates = period.dates || [];
			const allDates = [...new Set([...dates, ...existingDates])];

			// Update the period
			const response = await fetchData<Period>(
				API_ROUTES.dates.PERIODS_DETAIL(periodId),
				'PUT',
				{ dates: allDates },
			);

			if (response.error) {
				throw new Error(response.error);
			}

			useToast.update(toastId, {
				loading: false,
				message: `Added ${dates.length} date${dates.length !== 1 ? 's' : ''} to ${period.name}`,
				title: 'Period updated successfully',
				type: 'success',
			});

			// Refresh the periods data
			mutatePeriods();
		}
		catch (error) {
			useToast.update(toastId, {
				loading: false,
				message: error.message || 'Failed to update period',
				title: 'Error updating period',
				type: 'error',
			});
		}
	};

	//
	// G. Context value

	const contextValue: EventsCalendarContextState = useMemo(() => ({
		actions: {
			addDatesToPeriod,
		},
		data: {
			annotations: annotationsData || [],
			events: calendarEvents,
			eventTypeCounts,
			filteredEvents,
			periods: periodsData || [],
		},
		flags: {
			error: hasError || null,
			loading: isLoading,
		},
	}), [addDatesToPeriod, annotationsData, calendarEvents, eventTypeCounts, filteredEvents, hasError, isLoading, periodsData]);

	//
	// H. Render

	return (
		<EventsCalendarContext.Provider value={contextValue}>
			{children}
		</EventsCalendarContext.Provider>
	);

	//
};
