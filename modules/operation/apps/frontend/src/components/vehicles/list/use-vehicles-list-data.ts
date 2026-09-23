'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Vehicle } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useVehiclesListFilterAgency } from './filters/VehiclesListFilterAgency/use-vehicles-list-filter-agency';
import { useVehiclesListFilterSearch } from './filters/VehiclesListFilterSearch/use-vehicles-list-filter-search';

/* * */

interface UseVehiclesListDataReturnType {
	data: Vehicle[]
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
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Vehicle[]>>(API_ROUTES.operation.VEHICLES_LIST, {
		fetcher: async (url: string) => await fetchApiData<Vehicle[]>({ url }),
		refreshInterval: 5_000,
	});

	//
	// C. Transform data

	const searchResultsData = useSearch<Vehicle>({
		accessors: ['_id', 'agency_id', 'license_plate'],
		data: data?.data,
		query: filterSearch.value,
	});

	const filteredData = useMemo(() => {
		if (!searchResultsData) return [];
		if (filterAgency.value.length === 0) return searchResultsData;
		return searchResultsData.filter(vehicle => filterAgency.value.includes(vehicle.agency_id));
	}, [filterAgency.value, searchResultsData]);

	//
	// D. Return data

	return useMemo(() => ({
		data: filteredData,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.timestamp, error, filteredData, isLoading, isValidating, mutate]);
};
