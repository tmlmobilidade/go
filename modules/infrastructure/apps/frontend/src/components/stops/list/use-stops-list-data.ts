'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsListFilters, type StopsListItem, StopsListResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useStopsLocationsData } from '../shared/use-stops-locations-data';
import { useStopsListFilterAgency } from './filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterDistrict } from './filters/StopsListFilterDistrict/use-stops-list-filter-district';
import { useStopsListFilterLocality } from './filters/StopsListFilterLocality/use-stops-list-filter-locality';
import { useStopsListFilterMunicipality } from './filters/StopsListFilterMunicipality/use-stops-list-filter-municipality';
import { useStopsListFilterParish } from './filters/StopsListFilterParish/use-stops-list-filter-parish';
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

	const { districtMap, isLoading: isLoadingLocations, localityMap, municipalityMap, parishMap } = useStopsLocationsData({
		permissions: { actions: ['read'], scope: 'stops' },
	});

	const filterAgency = useStopsListFilterAgency();
	const filterDistrict = useStopsListFilterDistrict();
	const filterMunicipality = useStopsListFilterMunicipality();
	const filterParish = useStopsListFilterParish();
	const filterLocality = useStopsListFilterLocality();
	const filterSearch = useStopsListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<StopsListFilters>(() => ({
		agency_ids: filterAgency.value,
		district_ids: filterDistrict.value,
		lifecycle_statuses: [],
		locality_ids: filterLocality.value,
		municipality_ids: filterMunicipality.value,
		parish_ids: filterParish.value,
	}), [filterAgency.value, filterMunicipality.value, filterDistrict.value, filterLocality.value, filterParish.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<StopsListResponse[]>>([API_ROUTES.infrastructure.STOPS_LIST, query], {
		fetcher: async ([url, query]) => await fetchApiData<StopsListResponse[]>({ body: query, method: 'POST', url }),
		refreshInterval: 600_000, // 10 minutes
	});

	//
	// D. Transform data

	const populatedStops = useMemo<StopsListItem[]>(() => {
		return data?.data?.map(item => ({
			...item,
			district_name: districtMap.get(item.district_id)?.name,
			locality_name: localityMap.get(item.locality_id)?.name,
			municipality_name: municipalityMap.get(item.municipality_id)?.name,
			parish_name: parishMap.get(item.parish_id)?.name,
		}));
	}, [data?.data, districtMap, localityMap, municipalityMap, parishMap]);

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
		isLoading: isLoading || isLoadingLocations,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [searchResultsData, data?.timestamp, error, isLoading, isValidating, mutate]);
};
