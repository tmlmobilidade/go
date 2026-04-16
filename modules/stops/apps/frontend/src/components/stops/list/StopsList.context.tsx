'use client';

/* * */

import { useLocationsContext } from '@/contexts/Locations.context';
import { type StopNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { LifecycleStatusSchema, type Stop, StopConnectionSchema, StopEquipmentSchema, StopFacilitySchema } from '@tmlmobilidade/types';
import { parseAsArrayOfStrings, useSearch } from '@tmlmobilidade/ui';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsListContextState {
	actions: {
		setFilterConnections: (values: string[]) => void
		setFilterDistricts: (values: string[]) => void
		setFilterEquipment: (values: string[]) => void
		setFilterFacilities: (values: string[]) => void
		setFilterLifecycleStatus: (values: string[]) => void
		setFilterLocalities: (values: string[]) => void
		setFilterMunicipalities: (values: string[]) => void
		setFilterParishes: (values: string[]) => void
		setFilterSearch: (value: string) => void
	}
	data: {
		filtered: StopNormalized[]
		raw: Stop[]
	}
	filters: {
		connections: string[]
		districts: string[]
		equipment: string[]
		facilities: string[]
		lifecycle_status: string[]
		localities: string[]
		municipalities: string[]
		parishes: string[]
		search: string
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const StopsListContext = createContext<StopsListContextState | undefined>(undefined);

export const useStopsListContext = () => {
	const context = useContext(StopsListContext);
	if (!context) {
		throw new Error('useStopsListContext must be used within a StopsListContextProvider');
	}
	return context;
};

/* * */

export const StopsListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	const [filterSearch, setFilterSearch] = useQueryState('search', { defaultValue: '' });
	const [filterDistricts, setFilterDistricts] = useQueryState<string[]>('districts', parseAsArrayOfStrings.withDefault(locationsContext.data.district_ids));
	const [filterMunicipalities, setFilterMunicipalities] = useQueryState<string[]>('municipalities', parseAsArrayOfStrings.withDefault(locationsContext.data.municipality_ids));
	const [filterParishes, setFilterParishes] = useQueryState<string[]>('parishes', parseAsArrayOfStrings.withDefault(locationsContext.data.parish_ids));
	const [filterLocalities, setFilterLocalities] = useQueryState<string[]>('localities', parseAsArrayOfStrings.withDefault(locationsContext.data.locality_ids));
	const [filterFacilities, setFilterFacilities] = useQueryState<string[]>('facilities', parseAsArrayOfStrings.withDefault(StopFacilitySchema.options));
	const [filterEquipment, setFilterEquipment] = useQueryState<string[]>('equipment', parseAsArrayOfStrings.withDefault(StopEquipmentSchema.options));
	const [filterConnections, setFilterConnections] = useQueryState<string[]>('connections', parseAsArrayOfStrings.withDefault(StopConnectionSchema.options));
	const [filterLifecycleStatus, setFilterLifecycleStatus] = useQueryState<string[]>('lifecycle_status', parseAsArrayOfStrings.withDefault(LifecycleStatusSchema.options));

	//
	// B. Fetch data

	const { data: allStopsData, error: allStopsError, isLoading: allStopsLoading } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const normalizedStopsData: StopNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allStopsData?.length) return [];
		// Normalize record fields
		return allStopsData.map(item => ({
			...item,
			district_name: locationsContext.data.districts_map.get(item.district_id)?.name ?? '',
			locality_name: locationsContext.data.localities_map.get(item.locality_id)?.name ?? 'N/A',
			municipality_name: locationsContext.data.municipalities_map.get(item.municipality_id)?.name ?? '',
			name_normalized: normalizeString(item.name),
			new_name_normalized: normalizeString(item.new_name),
			parish_name: locationsContext.data.parishes_map.get(item.parish_id)?.name ?? '',
		}));
	}, [
		allStopsData,
		locationsContext.data.districts_map,
		locationsContext.data.localities_map,
		locationsContext.data.municipalities_map,
		locationsContext.data.parishes_map,
	]);

	const searchResultsData = useSearch<StopNormalized>({
		accessors: ['_id', 'name_normalized', 'new_name_normalized', 'legacy_id'],
		data: normalizedStopsData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData?.length) return [];
		// Convert filter arrays to sets for O(1) membership checks
		// const filterDistrictsSet = new Set(filterDistricts);
		// const filterMunicipalitiesSet = new Set(filterMunicipalities);
		// const filterParishesSet = new Set(filterParishes);
		// const filterLocalitiesSet = new Set(filterLocalities);
		// const filterFacilitiesSet = new Set(filterFacilities);
		// const filterEquipmentSet = new Set(filterEquipment);
		// const filterConnectionsSet = new Set(filterConnections);
		// Apply filter values
		return searchResultsData
			.filter((stopData: StopNormalized) => {
				const lifecycleStatusMatch = filterLifecycleStatus.includes(stopData.lifecycle_status);
				const matchesDistrict = true; // filterDistrictsSet.has(stopData.district_id);
				const matchesMunicipality = true;// filterMunicipalitiesSet.has(stopData.municipality_id);
				const matchesParish = true; // filterParishesSet.has(stopData.parish_id);
				const matchesLocality = true; //  filterLocalitiesSet.has(stopData.locality_id);
				const matchesFacilities = true; // stopData.facilities.some(item => filterFacilitiesSet.has(item));
				const matchesEquipment = true; // stopData.equipment.some(item => filterEquipmentSet.has(item));
				const matchesConnections = true; // stopData.connections.some(item => filterConnectionsSet.has(item));
				// Evaluate conditions
				return lifecycleStatusMatch && matchesDistrict && matchesMunicipality && matchesParish && matchesLocality && matchesFacilities && matchesEquipment && matchesConnections;
			})
			.sort((a, b) => {
				return String(a._id).localeCompare(String(b._id));
			});
	}, [searchResultsData, filterLifecycleStatus]);

	//
	// D. Define context value

	const contextValue: StopsListContextState = {
		actions: {
			setFilterConnections,
			setFilterDistricts,
			setFilterEquipment,
			setFilterFacilities,
			setFilterLifecycleStatus,
			setFilterLocalities,
			setFilterMunicipalities,
			setFilterParishes,
			setFilterSearch,
		},
		data: {
			filtered: filterResultsData,
			raw: allStopsData ?? [],
		},
		filters: {
			connections: filterConnections,
			districts: filterDistricts,
			equipment: filterEquipment,
			facilities: filterFacilities,
			lifecycle_status: filterLifecycleStatus,
			localities: filterLocalities,
			municipalities: filterMunicipalities,
			parishes: filterParishes,
			search: filterSearch,
		},
		flags: {
			error: allStopsError,
			loading: allStopsLoading,
		},
	};

	//
	// E. Render components

	return (
		<StopsListContext.Provider value={contextValue}>
			{children}
		</StopsListContext.Provider>
	);

	//
};
