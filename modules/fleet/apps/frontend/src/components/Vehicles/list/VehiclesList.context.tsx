'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Vehicle } from '@tmlmobilidade/types';
import { parseAsArrayOfStrings, useSearch } from '@tmlmobilidade/ui';
import { useQueryState } from 'nuqs';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VehicleNormalized extends Vehicle {
	agency_id_normalized: string
	dates_normalized: string[]
}

/* * */

interface VehicleListContextState {
	actions: {
		setFilterAgency: (values: string) => void
		setFilterDates: (values: string[]) => void
		setFilterSearch: (values: string) => void
	}
	data: {
		filtered: VehicleNormalized[]
		raw: Vehicle[]
	}
	filters: {
		agency: string[]
		dates: string[]
		search: string
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

	const agenciesContext = useAgenciesContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterAgency, setFilterAgency] = useQueryState<string[]>('agency', parseAsArrayOfStrings.withDefault(agenciesContext.data.raw.map(item => item._id)));
	const [filterDates, setFilterDates] = useQueryState<string[]>('dates', parseAsArrayOfStrings.withDefault([]));

	//
	// B. Fetch data

	const { data: allVehicleData, error: allVehicleError, isLoading: allVehicleLoading } = useSWR<Vehicle[], Error>(API_ROUTES.fleet.VEHICLES_LIST, { refreshInterval: 5000 });

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
			};
		});
	}, [allVehicleData, agenciesContext.data.raw]);

	const searchResultsData = useSearch<VehicleNormalized>({
		accessors: ['_id', 'agency_id', 'vehicle_id', 'license_plate', 'make', 'model', 'owner'],
		data: normalizedVehicleData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];
		// 1. Convert filter arrays to sets for O(1) membership checks
		const agencySet = new Set(filterAgency);
		const datesSet = new Set(filterDates);

		return searchResultsData
			.filter((item: VehicleNormalized) => {
				// Filter by agency - check if any of the vehicle's agencies match the filter
				// If vehicle has no agencies (null or empty), show it in all results
				if (filterAgency.length > 0) {
					if (!item.agency_id || item.agency_id.length === 0) {
						return true; // Show vehicles with no agencies in all filters
					}
					const hasMatchingAgency = item.agency_id.some(agencyId => agencySet.has(agencyId));
					if (!hasMatchingAgency) return false;
				}

				// Filter by dates - check if any of the vehicle's dates match the filter
				if (filterDates.length > 0) {
					const hasMatchingDate = item.dates_normalized.some(date => datesSet.has(date));
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

	const contextValue: VehicleListContextState = useMemo(() => ({
		actions: {
			setFilterAgency,
			setFilterDates,
			setFilterSearch,
		},
		data: {
			filtered: filterResultsData,
			raw: allVehicleData || [],
		},
		filters: {
			agency: filterAgency,
			dates: filterDates,
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
		filterDates,
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
