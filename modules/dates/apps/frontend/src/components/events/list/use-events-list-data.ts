'use client';

import { type EventNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { normalizeString } from '@tmlmobilidade/strings';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useEventsListFilterAgencies } from './filters/EventsListFilterAgencies/use-events-list-filter-agencies';
import { useEventsListFilterDates } from './filters/EventsListFilterDates/use-events-list-filter-dates';
import { useEventsListFilterSearch } from './filters/EventsListFilterSearch/use-events-list-filter-search';

/* * */

interface UseEventsListDataReturnType {
	data: EventNormalized[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useEventsListData(): UseEventsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgencies = useEventsListFilterAgencies();
	const filterDates = useEventsListFilterDates();
	const filterSearch = useEventsListFilterSearch();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Event[]>>(API_ROUTES.dates.EVENTS_LIST, {
		fetcher: async (url: string) => await fetchApiData<Event[]>({ url }),
	});

	//
	// C. Transform data

	const normalizedData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Normalize the record fields used by the search
		return data.data.map((item): EventNormalized => ({
			...item,
			agency_ids_normalized: normalizeString(item.agency_ids.join(', ')),
		}));
	}, [data?.data]);

	const searchResultsData = useSearch<EventNormalized>({
		accessors: ['_id', 'title', 'description', 'agency_ids_normalized'],
		data: normalizedData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Convert the filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgencies.value);
		const datesSet = new Set(filterDates.value);
		// Keep only the items matching every active filter, newest first
		return searchResultsData
			.filter((item) => {
				if (!item.agency_ids.some(agencyId => agencySet.has(agencyId))) return false;
				if (filterDates.value.length > 0 && !item.dates.some(date => datesSet.has(String(date)))) return false;
				return true;
			})
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}, [searchResultsData, filterAgencies.value, filterDates.value]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filterResultsData,
		error: data?.error ?? error?.error ?? null,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [filterResultsData, data?.error, data?.timestamp, error, isLoading, isValidating, mutate]);
};
