'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type VehiclesListFilters, type VehiclesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { normalizeString } from '@tmlmobilidade/strings';
import { fetchApiData, useSearch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useVehiclesListFilterAgency } from './filters/VehiclesListFilterAgency/use-vehicles-list-filter-agency';
import { useVehiclesListFilterEmission } from './filters/VehiclesListFilterEmission/use-vehicles-list-filters-emission';
import { useVehiclesListFilterPropulsion } from './filters/VehiclesListFilterPropulsion/use-vehicles-list-filters-propulsion';
import { useVehiclesListFilterSearch } from './filters/VehiclesListFilterSearch/use-vehicles-list-filter-search';
import { useVehiclesListFilterType } from './filters/VehiclesListFilterType/use-vehicles-list-filters-type';

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
	const filterType = useVehiclesListFilterType();
	const filterEmission = useVehiclesListFilterEmission();
	const filterPropulsion = useVehiclesListFilterPropulsion();

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

	const filteredVehiclesData = useMemo(() => {
		return data?.data?.filter(vehicle =>
			filterType.value.includes(vehicle.vehicle_type) &&
			filterEmission.value.includes(vehicle.emission) &&
			filterPropulsion.value.includes(vehicle.propulsion));
	}, [data?.data, filterType.value, filterEmission.value, filterPropulsion.value]);

	const searchResultsData = useSearch<VehiclesListItem>({
		accessors: ['_id'],
		customSearch: (vehicle, query) => vehicle.flags.some(flag => normalizeString(flag.vehicle_id).includes(query)),
		data: filteredVehiclesData,
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
