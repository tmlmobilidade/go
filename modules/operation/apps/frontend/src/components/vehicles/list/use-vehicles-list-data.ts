'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type VehiclesListFilters, type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useVehiclesListFilterAgency } from './filters/VehiclesListFilterAgency/use-vehicles-list-filter-agency';
import { useVehiclesListFilterSearch } from './filters/VehiclesListFilterSearch/use-vehicles-list-filter-search';

/* * */

interface UseVehiclesListDataReturnType {
	data: VehiclesListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useVehiclesListData(): UseVehiclesListDataReturnType {
	//

	//
	// A. Setup variables

	const filterAgency = useVehiclesListFilterAgency();
	const filterSearch = useVehiclesListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<VehiclesListFilters>(() => ({
		agency_ids: filterAgency.value,
	}), [filterAgency.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR([API_ROUTES.operation.VEHICLES_LIST, query], {
		fetcher: async ([url, body]: [string, VehiclesListFilters]) => await fetchApiData<VehiclesListItem[]>({ body, method: 'POST', url }),
		refreshInterval: 5_000,
	});

	//
	// D. Transform data

	const searchResultsData = useSearch<VehiclesListItem>({
		accessors: ['_id', 'agency_id', 'license_plate'],
		data: data?.data,
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
	}), [data?.timestamp, error, isLoading, isValidating, mutate, searchResultsData]);
};
