'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsListFilters, type StopsListItem, type StopsListResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useStopsListFilterAgency } from './filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterLocationNeighbourhood } from './filters/StopsListFilterLocationNeighberhood/use-stops-list-filter-location-neighberhood';
import { useStopsListFilterLocationPrimary } from './filters/StopsListFilterLocationPrimary/use-stops-list-filter-location-primary';
import { useStopsListFilterLocationSecondary } from './filters/StopsListFilterLocationSecondary/use-stops-list-filter-location-secondary';
import { useStopsListFilterLocationTertiary } from './filters/StopsListFilterLocationTertiary/use-stops-list-filter-location-tertiary';
import { useStopsListFilterSearch } from './filters/StopsListFilterSearch/use-stops-list-filter-search';

/* * */

interface UseStopsListDataReturnType {
	data: StopsListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useStopsListData(): UseStopsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgency = useStopsListFilterAgency();
	const filterLocationNeighbourhood = useStopsListFilterLocationNeighbourhood();
	const filterLocationPrimary = useStopsListFilterLocationPrimary();
	const filterLocationSecondary = useStopsListFilterLocationSecondary();
	const filterLocationTertiary = useStopsListFilterLocationTertiary();
	const filterSearch = useStopsListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<StopsListFilters>(() => ({
		agency_ids: filterAgency.value,
		lifecycle_statuses: [],
		location_neighbourhood_ids: filterLocationNeighbourhood.value,
		location_primary_ids: filterLocationPrimary.value,
		location_secondary_ids: filterLocationSecondary.value,
		location_tertiary_ids: filterLocationTertiary.value,
	}), [filterAgency.value, filterLocationNeighbourhood.value, filterLocationPrimary.value, filterLocationSecondary.value, filterLocationTertiary.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<StopsListResponse[]>>([API_ROUTES.infrastructure.STOPS_LIST, query], {
		fetcher: async ([url, query]: [string, StopsListFilters]) => await fetchApiData<StopsListResponse[]>({ body: query, method: 'POST', url }),
		refreshInterval: 600_000, // 10 minutes
	});

	//
	// D. Transform data

	const populatedStops = useMemo<StopsListItem[]>(() => {
		return data?.data?.map(item => ({
			...item,
			neighbourhood_name: item.location.neighbourhood?.name ?? '',
			primary_location_name: item.location.primary.name,
			secondary_location_name: item.location.secondary.name,
			tertiary_location_name: item.location.tertiary.name,
		}));
	}, [data?.data]);

	const searchResultsData = useSearch<StopsListItem>({
		accessors: ['_id', 'name'],
		data: populatedStops,
		query: filterSearch.value,
	});

	//
	// E. Return data

	return useMemo(() => ({
		data: searchResultsData,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [searchResultsData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
