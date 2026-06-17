'use client';

import { useLocationsContext } from '@/contexts/Locations.context';
import { type StopNormalized } from '@/types/normalized';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { LifecycleStatusSchema, type Stop, StopConnectionSchema, StopEquipmentSchema, StopFacilitySchema } from '@tmlmobilidade/types';
import { type ListContextStateTemplate, useAgenciesContext, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, useSearch } from '@tmlmobilidade/ui';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsListContextState extends ListContextStateTemplate {
	data: {
		filtered: StopNormalized[]
		raw: Stop[]
	}
	filters: ListContextStateTemplate['filters'] & {
		agencies: UseFilterStateListReturnType
		connections: UseFilterStateListReturnType
		equipment: UseFilterStateListReturnType
		facilities: UseFilterStateListReturnType
		lifecycle_status: UseFilterStateListReturnType
		municipality: UseFilterStateListReturnType
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

	const agenciesContext = useAgenciesContext();
	const locationsContext = useLocationsContext();

	const filterSearch = useFilterStateString('search');
	const filterFacilities = useFilterStateList('facilities', StopFacilitySchema.options, StopFacilitySchema.options.map(item => ({ label: item, value: item })));
	const filterEquipment = useFilterStateList('equipment', StopEquipmentSchema.options, StopEquipmentSchema.options.map(item => ({ label: item, value: item })));
	const filterConnections = useFilterStateList('connections', StopConnectionSchema.options, StopConnectionSchema.options.map(item => ({ label: item, value: item })));
	const filterLifecycleStatus = useFilterStateList('lifecycle_status', LifecycleStatusSchema.options, LifecycleStatusSchema.options.map(item => ({ label: item, value: item })));
	const filterAgencies = useFilterStateList('agencies', agenciesContext.data.raw.map(item => item._id), agenciesContext.data.as_options);
	const filterMunicipality = useFilterStateList('municipalities', locationsContext.data.municipality_ids, (locationsContext.data.municipalities ?? []).map(item => ({ label: item.name, value: item._id })).sort((a, b) => a.label.localeCompare(b.label, 'pt')));
	// B. Fetch data

	const { data: allStopsData, error: allStopsError, isLoading: allStopsLoading } = useSWR<Stop[]>(API_ROUTES.stops.STOPS_LIST, { refreshInterval: 5000 });

	//
	// C. Transform data

	const normalizedStopsData: StopNormalized[] = useMemo(() => {
		// Skip if no data is available
		if (!allStopsData?.length) return [];
		// Normalize record fields
		return allStopsData.map((item): StopNormalized => ({
			...item,
			district_name: locationsContext.data.districts_map.get(item.district_id)?.name ?? '',
			legacy_ids_normalized: item.legacy_ids?.map(String).join(' '),
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
		accessors: ['_id', 'name_normalized', 'new_name_normalized', 'legacy_ids_normalized'],
		data: normalizedStopsData,
		query: filterSearch.value,
	});

	const filteredMunicipalityOptions = useMemo(() => {
		if (!allStopsData?.length || !filterMunicipality.options?.length) {
			return filterMunicipality.options;
		}
		const municipalityIds = new Set(allStopsData.map(stop => stop.municipality_id));

		return filterMunicipality.options.filter(item => municipalityIds.has(item.value));
	}, [allStopsData, filterMunicipality.options]);

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData?.length) return [];
		// Apply filter values
		return searchResultsData
			.filter((stopData: StopNormalized) => {
				const lifecycleStatusMatch = filterLifecycleStatus.value.includes(stopData.lifecycle_status);
				const matchesFacilities = stopData.facilities?.length ? stopData.facilities.some(item => filterFacilities.value.includes(item)) : true;
				const matchesEquipment = stopData.equipment?.length ? stopData.equipment.some(item => filterEquipment.value.includes(item)) : true;
				const matchesConnections = stopData.connections?.length ? stopData.connections.some(item => filterConnections.value.includes(item)) : true;
				const stopAgencyIds = stopData.flags?.flatMap(flag => flag.agency_ids) ?? [];
				const matchesAgencies = !filterAgencies.isActive || stopAgencyIds.some(agencyId => filterAgencies.value.includes(agencyId));
				const matchesMunicipalities = !filterMunicipality.isActive || filterMunicipality.value.includes(stopData.municipality_id);
				// Evaluate conditions
				return lifecycleStatusMatch && matchesFacilities && matchesEquipment && matchesConnections && matchesAgencies && matchesMunicipalities;
			})
			.sort((a, b) => {
				return String(a._id).localeCompare(String(b._id));
			});
	}, [
		searchResultsData,
		filterAgencies.isActive,
		filterAgencies.value,
		filterLifecycleStatus,
		filterFacilities,
		filterEquipment,
		filterConnections,
		filterMunicipality.isActive,
		filterMunicipality.value,
	]);

	//
	// D. Define context value

	const contextValue: StopsListContextState = {
		data: {
			filtered: filterResultsData,
			raw: allStopsData ?? [],
		},
		filters: {
			agencies: filterAgencies,
			connections: filterConnections,
			equipment: filterEquipment,
			facilities: filterFacilities,
			lifecycle_status: filterLifecycleStatus,
			municipality: { ...filterMunicipality, options: filteredMunicipalityOptions },
			search: filterSearch,
		},
		flags: {
			error: allStopsError,
			isLoading: allStopsLoading,
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
