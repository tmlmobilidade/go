'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type Vehicle } from '@tmlmobilidade/types';
import { useDataAgencies, useFilterStateList, UseFilterStateListReturnType, useFilterStateString, UseFilterStateStringReturnType, useSearch } from '@tmlmobilidade/ui';
import { unauthenticatedSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VehicleNormalized extends Vehicle {
	agency_id_normalized: string
}

/* * */

interface VehicleListContextState {
	data: {
		filtered: VehicleNormalized[]
		raw: Vehicle[]
	}
	filters: {
		agency: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const VehiclesListContext = createContext<undefined | VehicleListContextState>(undefined);

export const useVehiclesListContext = () => {
	const context = useContext(VehiclesListContext);
	if (!context) {
		throw new Error('useVehiclesListContext must be used within a VehiclesListContextProvider');
	}
	return context;
};

/* * */

export const VehiclesListContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const { filteredIds: filteredAgencyIds, options: filteredAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.vehicles.actions.read],
		scope: PermissionCatalog.all.alerts.scope,
	});

	const filterSearch = useFilterStateString('search');
	const filterAgency = useFilterStateList('agency', filteredAgencyIds, filteredAgencyOptions);

	//
	// B. Fetch data

	const { data: allVehicleData, error: allVehicleError, isLoading: allVehicleLoading } = useSWR<Vehicle[], Error>(API_ROUTES.fleet.VEHICLES_LIST, unauthenticatedSwrFetcher, { refreshInterval: 5000 });

	//
	// C. Transform data

	const normalizedVehicleData: VehicleNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allVehicleData) return [];
		// Normalize record fields
		return allVehicleData.map((item) => {
			return {
				...item,
				agency_id_normalized: item.agency_id,
				dates_normalized: [],
			};
		});
	}, [allVehicleData, filteredAgencyIds]);

	const searchResultsData = useSearch<VehicleNormalized>({
		accessors: ['_id', 'agency_id', 'license_plate'],
		data: normalizedVehicleData,
		query: filterSearch.value,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// Skip if no query filters are set
		if (filterAgency.value.length === 0) return searchResultsData;
		// Filter by query filters
		return searchResultsData.filter((vehicle: VehicleNormalized) => {
			// Filter by agency IDs
			if (!filterAgency.value.includes(vehicle.agency_id_normalized)) return false;
			// Return true if all filters pass
			return true;
		});
	}, [
		searchResultsData,
		filterAgency,
	]);

	//
	// D. Define context value

	const contextValue: VehicleListContextState = useMemo(() => ({
		data: {
			filtered: filterResultsData,
			raw: allVehicleData || [],
		},
		filters: {
			agency: filterAgency,
			search: filterSearch,
		},
		flags: {
			error: allVehicleError,
			loading: allVehicleLoading,
		},
	}), [
		allVehicleError,
		allVehicleLoading,
		filterResultsData,
		allVehicleData,
		filterAgency,
		filterSearch,
	]);

	//
	// E. Render components

	return (
		<VehiclesListContext.Provider value={contextValue}>
			{children}
		</VehiclesListContext.Provider>
	);

	//
};
