'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, useFilterStateList, type UseFilterStateListReturnType, useFilterStateText, type UseFilterStateTextReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface EventsListContextState {
	data: {
		filtered: Event[]
		raw: Event[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		dates: UseFilterStateListReturnType
		search: UseFilterStateTextReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const EventsListContext = createContext<EventsListContextState | undefined>(undefined);

export const useEventsListContext = () => {
	const context = useContext(EventsListContext);
	if (!context) {
		throw new Error('useEventsListContext must be used within a EventsListContextProvider');
	}
	return context;
};

/* * */

export const EventsListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { ids: allAgencyIds, options: allAgencyOptions } = useAgenciesData();

	const { data: allEventsData, error: allEventsError, isLoading: allEventsLoading } = useSWR(API_ROUTES.offer.EVENTS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Event[]>({ url }),
	});

	//
	// B. Setup filters

	const filterSearch = useFilterStateText('search');
	const filterAgency = useFilterStateList('agency', allAgencyIds, allAgencyOptions);

	// Get all unique dates from events for the dates filter
	const allDatesOptions = useMemo(() => {
		if (!allEventsData) return [];
		const uniqueDates = new Set<string>();
		allEventsData.data?.forEach((event) => {
			event.dates.forEach(date => uniqueDates.add(String(date)));
		});
		return Array.from(uniqueDates).sort().map(date => ({
			checked: false,
			disabled: false,
			label: date,
			value: date,
		}));
	}, [allEventsData]);

	const filterDates = useFilterStateList('dates', [], allDatesOptions);

	//
	// C. Transform data

	const searchResultsData = useSearch<Event>({
		accessors: ['_id', 'title', 'description', 'agency_ids'],
		data: allEventsData?.data ?? [],
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		const datesSet = new Set(filterDates.value);

		return searchResultsData
			.filter((item: Event) => {
				// Filter by agency - check if any of the event's agencies match the filter
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;

				// Filter by dates - check if any of the event's dates match the filter
				if (filterDates.value.length > 0) {
					const hasMatchingDate = item.dates.some(date => datesSet.has(String(date)));
					if (!hasMatchingDate) return false;
				}

				// Return true if all filters pass
				return true;
			})
			.sort((a, b) => {
				// Sort by created_at descending (newest first)
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [searchResultsData, filterAgency, filterDates]);

	//
	// D. Define context value

	const contextValue: EventsListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allEventsData?.data ?? [],
		},
		filters: {
			agency: filterAgency,
			dates: filterDates,
			search: filterSearch,
		},
		flags: {
			error: allEventsError,
			loading: allEventsLoading,
		},
	}), [
		allEventsError,
		allEventsLoading,
		filterResultsData,
		filterDates,
		allEventsData,
		filterAgency,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<EventsListContext.Provider value={contextValue}>
			{children}
		</EventsListContext.Provider>
	);

	//
};
