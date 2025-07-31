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
		setFilterEquipment: (values: string[]) => void
		setFilterFacilities: (values: string[]) => void
	}
	data: {
		filtered: StopNormalized[]
		raw: Stop[]
	}
	filters: {
		connections: string[]
		equipment: string[]
		facilities: string[]
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

	const [queryFacilities, setQueryFacilities] = useQueryState<string[]>('facilities', parseAsArrayOfStrings.withDefault([]));
	const [queryEquipment, setQueryEquipment] = useQueryState<string[]>('equipment', parseAsArrayOfStrings.withDefault([]));
	const [queryConnections, setQueryConnections] = useQueryState<string[]>('connections', parseAsArrayOfStrings.withDefault([]));

	//

	//
	// B. Fetch data

	const { data: stops, error, isLoading } = useSWR<Stop[], Error>(Routes.ME, swrFetcher);

	const rawStops = useMemo(() => stops || [], [stops]);

	useEffect(() => {
		setFilterFacilities(queryFacilities.length === 0 ? facilitiesSchema.options : queryFacilities);
		setFilterEquipment(queryEquipment.length === 0 ? equipmentSchema.options : queryEquipment);
		setFilterConnections(queryConnections.length === 0 ? connectionsSchema.options : queryConnections);
	}, [queryFacilities, queryEquipment, queryConnections]);

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
		if (
			queryFacilities.length === 0
			&& queryEquipment.length === 0
			&& queryConnections.length === 0
			&& !locationsContext.data.selectedLocation?.districts
			&& !locationsContext.data.selectedLocation?.municipalities
			&& !locationsContext.data.selectedLocation?.parishes

		) return searchResultsData;

		// 1. Convert filter arrays to sets for O(1) membership checks
		const filterFacilitiesSet = new Set(queryFacilities);
		const filterEquipmentSet = new Set(queryEquipment);
		const filterConnectionsSet = new Set(queryConnections);

		// 2. Filter by query filters

		return searchResultsData.filter((stop: StopNormalized) => {
			const matchesFacilities = queryFacilities.length === 0 || stop.facilities.some(item => filterFacilitiesSet.has(item));
			const matchesEquipment = queryEquipment.length === 0 || stop.equipment.some(item => filterEquipmentSet.has(item));
			const matchesConnections = queryConnections.length === 0 || stop.connections.some(item => filterConnectionsSet.has(item));

			const selectedDistricts = locationsContext.data.selectedLocation?.districts;
			const matchesDistrict = selectedDistricts?.some(item => item._id === stop.district_id);

			const selectedMunicipalities = locationsContext.data.selectedLocation?.municipalities;
			const matchesMunicipality = selectedMunicipalities?.some(item => item._id === stop.municipality_id);

			const selectedParishes = locationsContext.data.selectedLocation?.parishes;
			const matchesParish = selectedParishes?.some(item => item._id === stop.parish_id);

			return matchesFacilities && matchesEquipment && matchesConnections && matchesDistrict && matchesMunicipality && matchesParish;
		});
	}, [searchResultsData, filterFacilities, filterEquipment, filterConnections, queryConnections, queryEquipment, queryFacilities, locationsContext.data]);

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

	//

	//
	// E. render components

	const contextValue: StopListContextState = useMemo(
		() => ({
			actions: {
				changeSearchQuery: changeSearchQuery,
				setFilterConnections: handleSetFilterConnections,
				setFilterEquipment: handleSetfilterEquipment,
				setFilterFacilities: handleSetFilterFacilities,
			},
			data: {
				filtered: filterResultsData,
				raw: rawStops,
			},
			filters: {
				connections: filterConnections,
				equipment: filterEquipment,
				facilities: filterFacilities,
			},
			flags: {
				error,
				isLoading,
			},
		}),
		[filterResultsData, rawStops, error, isLoading, filterConnections, filterEquipment, filterFacilities],
	);

	return (
		<StopListContext.Provider value={contextValue}>
			{children}
		</StopListContext.Provider>
	);
};
