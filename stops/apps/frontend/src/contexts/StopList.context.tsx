'use client';

import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { Routes } from '@/lib/routes';
import { type StopNormalized } from '@/types/normalized';
import { connectionsSchema, equipmentSchema, facilitiesSchema, Stop } from '@tmlmobilidade/types';
import { useSearch } from '@tmlmobilidade/ui';
import { normalizeString, swrFetcher } from '@tmlmobilidade/utils';
import { useQueryState } from 'nuqs';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { useLocationsContext } from './Locations.context';

interface StopListContextState {
	actions: {
		changeSearchQuery: (query: string) => void
		setFilterConnections: (values: string[]) => void
		setFilterDistrict: (values: string[]) => void
		setFilterEquipment: (values: string[]) => void
		setFilterFacilities: (values: string[]) => void
		setFilterMunicipality: (values: string[]) => void
	}
	data: {
		filtered: StopNormalized[]
		raw: Stop[]
	}
	filters: {
		filterConnections: string[]
		filterDistrict: string[]
		filterEquipment: string[]
		filterFacilities: string[]
		filterMunicipality: string[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

const StopListContext = createContext<StopListContextState | undefined>(undefined);

export const useStopListContext = () => {
	const context = useContext(StopListContext);
	if (!context) {
		throw new Error(
			'useStopListContext must be used within a StopListContextProvider',
		);
	}
	return context;
};

export const StopListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();

	const [filterSearch, setfilterSearch] = useQueryState('search', { defaultValue: '' });

	const [filterFacilities, setFilterFacilities] = useState<string[]>(facilitiesSchema.options);
	const [filterEquipment, setFilterEquipment] = useState<string[]>(equipmentSchema.options);
	const [filterConnections, setFilterConnections] = useState<string[]>(connectionsSchema.options);
	const [filterDistrict, setFilterDistrict] = useState<string[]>(locationsContext.data.district_ids);
	const [filterMunicipality, setFilterMunicipality] = useState<string[]>(locationsContext.data.municipality_ids);

	const [queryFacilities, setQueryFacilities] = useQueryState<string[]>('facilities', parseAsArrayOfStrings.withDefault([]));
	const [queryEquipment, setQueryEquipment] = useQueryState<string[]>('equipment', parseAsArrayOfStrings.withDefault([]));
	const [queryConnections, setQueryConnections] = useQueryState<string[]>('connections', parseAsArrayOfStrings.withDefault([]));
	const [queryDistrict, setQueryDistrict] = useQueryState<string[]>('district', parseAsArrayOfStrings.withDefault([]));
	const [queryMunicipality, setQueryMunicipality] = useQueryState<string[]>('municipality', parseAsArrayOfStrings.withDefault([]));

	//

	//
	// B. Fetch data

	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);

	const rawStops = useMemo(() => stops || [], [stops]);

	useEffect(() => {
		setFilterFacilities(queryFacilities.length === 0 ? facilitiesSchema.options : queryFacilities);
		setFilterEquipment(queryEquipment.length === 0 ? equipmentSchema.options : queryEquipment);
		setFilterConnections(queryConnections.length === 0 ? connectionsSchema.options : queryConnections);
		setFilterDistrict(queryDistrict.length === 0 ? locationsContext.data.district_ids : queryDistrict);
		setFilterMunicipality(queryMunicipality.length === 0 ? locationsContext.data.municipality_ids : queryMunicipality);
	}, [queryFacilities, queryEquipment, queryConnections, queryDistrict, queryMunicipality]);

	//

	//
	// C. Transform data

	const normalizedStopData: StopNormalized[] = useMemo(() => {
		if (!stops) return [];

		return stops.map(item => ({
			...item,
			id_normalized: item._id,
			name_normalized: normalizeString(item.name),
		}));
	}, [stops]);

	const searchResultsData = useSearch<StopNormalized>({
		accessors: ['_id', 'name'],
		data: normalizedStopData,
		query: filterSearch,
	});

	const filterResultsData = useMemo(() => {
		// Skip if no data is available
		if (!searchResultsData) return [];

		// Skip if no query filters are set
		if (queryFacilities.length === 0 && queryEquipment.length === 0 && queryConnections.length === 0 && queryDistrict.length === 0 && queryMunicipality.length === 0) return searchResultsData;

		// 1. Convert filter arrays to sets for O(1) membership checks
		const filterFacilitiesSet = new Set(filterFacilities);
		const filterEquipmentSet = new Set(filterEquipment);
		const filterConnectionsSet = new Set(filterConnections);
		const filterDistrictSet = new Set(filterDistrict);
		const filterMunicipalitySet = new Set(filterMunicipality);

		// 2. Filter by query filters

		return searchResultsData.filter((stop: StopNormalized) => {
			// Filter by facilities
			stop.facilities.forEach((item) => {
				if (!filterFacilitiesSet.has(item)) return false;
			});
			// Filter by equipment
			stop.equipment.forEach((item) => {
				if (!filterEquipmentSet.has(item)) return false;
			});
			// Filter by connections
			stop.connections.forEach((item) => {
				if (!filterConnectionsSet.has(item)) return false;
			});
			// Filter by district
			if (filterDistrict.length > 0 && !filterDistrictSet.has(stop.district_id)) return false;
			// Filter by municipality
			if (filterMunicipality.length > 0 && !filterMunicipalitySet.has(stop.municipality_id)) return false;
			return true;
		});
	}, [searchResultsData, filterFacilities, filterEquipment, filterConnections, filterDistrict, filterMunicipality, queryConnections, queryEquipment, queryFacilities, queryDistrict, queryMunicipality]);

	//

	//
	// D. handle declarated
	const changeSearchQuery = (query: string) => {
		setfilterSearch(query);
	};

	const handleSetFilterFacilities = (values: string[]) => {
		setQueryFacilities(values.length === facilitiesSchema.options.length ? [] : values);
		setFilterFacilities(values);
	};

	const handleSetfilterEquipment = (values: string[]) => {
		setQueryEquipment(values.length === equipmentSchema.options.length ? [] : values);
		setFilterEquipment(values);
	};

	const handleSetFilterConnections = (values: string[]) => {
		setQueryConnections(values.length === connectionsSchema.options.length ? [] : values);
		setFilterConnections(values);
	};

	const handleSetFilterDistrict = (values: string[]) => {
		setQueryDistrict(values.length === locationsContext.data.district_ids.length ? [] : values);
		setFilterDistrict(values);
	};

	const handleSetFilterMunicipality = (values: string[]) => {
		setQueryMunicipality(values.length === locationsContext.data.municipality_ids.length ? [] : values);
		setFilterMunicipality(values);
	};
	//

	//
	// E. render compose

	const contextValue: StopListContextState = useMemo(
		() => ({
			actions: {
				changeSearchQuery: changeSearchQuery,
				setFilterConnections: handleSetFilterConnections,
				setFilterDistrict: handleSetFilterDistrict,
				setFilterEquipment: handleSetfilterEquipment,
				setFilterFacilities: handleSetFilterFacilities,
				setFilterMunicipality: handleSetFilterMunicipality,
			},
			data: {
				filtered: filterResultsData,
				raw: rawStops,
			},
			filters: {
				filterConnections,
				filterDistrict,
				filterEquipment,
				filterFacilities,
				filterMunicipality,
			},
			flags: {
				error,
				isLoading,
			},
		}),
		[filterResultsData, rawStops, error, isLoading, filterConnections, filterEquipment, filterFacilities, filterDistrict, filterMunicipality],
	);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};
