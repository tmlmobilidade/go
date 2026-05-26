'use client';

import { type EventNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { type Event, PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface EventsListContextState {
	data: {
		filtered: EventNormalized[]
		raw: Event[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		dates: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
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

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.events.actions.read],
		scope: PermissionCatalog.all.events.scope,
	});

	const { data: allEventsData, error: allEventsError, isLoading: allEventsLoading } = useSWR<Event[], Error>(API_ROUTES.dates.EVENTS_LIST);

	//
	// B. Setup filters

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	// Get all unique dates from events for the dates filter
	const allDatesOptions = useMemo(() => {
		if (!allEventsData) return [];
		const uniqueDates = new Set<string>();
		allEventsData.forEach((event) => {
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

	const normalizedEventsData: EventNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allEventsData) return [];
		// Normalize record fields
		return allEventsData.map((item) => {
			// Get agency IDs for normalization
			const agencyIds = item.agency_ids.join(', ');

			return {
				...item,
				agency_ids_normalized: normalizeString(agencyIds),
			};
		});
	}, [allEventsData]);

	const searchResultsData = useSearch<EventNormalized>({
		accessors: ['_id', 'title', 'description', 'agency_ids_normalized'],
		data: normalizedEventsData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency.value);
		const datesSet = new Set(filterDates.value);

		return searchResultsData
			.filter((item: EventNormalized) => {
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
			raw: allEventsData ?? [],
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
