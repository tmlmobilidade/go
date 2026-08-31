'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsListFilters, type StopsListItem, StopsListResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useStopsMunicipalitiesData } from '../shared/use-stops-municipalities-data';
import { useStopsListFilterAgency } from './filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterMunicipality } from './filters/StopsListFilterMunicipality/use-stops-list-filter-municipality';
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

	const { map: municipalitiesMap } = useStopsMunicipalitiesData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	const filterAgency = useStopsListFilterAgency();
	const filterMunicipality = useStopsListFilterMunicipality();
	const filterSearch = useStopsListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<StopsListFilters>(() => ({
		agency_ids: filterAgency.value,
		district_ids: [],
		lifecycle_statuses: [],
		locality_ids: [],
		municipality_ids: filterMunicipality.value,
		parish_ids: [],
		search: filterSearch.value,
	}), [filterSearch.value, filterAgency.value, filterMunicipality.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<StopsListResponse[]>>([API_ROUTES.infrastructure.STOPS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<StopsListResponse[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Transform data

	const populatedStops = useMemo<StopsListItem[]>(() => {
		return data?.data?.map(item => ({
			...item,
			district_name: municipalitiesMap.get(item.municipality_id)?.name,
			locality_name: municipalitiesMap.get(item.locality_id)?.name,
			municipality_name: municipalitiesMap.get(item.municipality_id)?.name,
			parish_name: municipalitiesMap.get(item.parish_id)?.name,
		}));
	}, [data?.data, municipalitiesMap]);

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
