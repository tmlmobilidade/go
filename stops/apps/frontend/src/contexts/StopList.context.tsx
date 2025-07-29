'use client';

import { parseAsArrayOfStrings } from '@/lib/parse-string-array';
import { Routes } from '@/lib/routes';
import { type StopNormalized } from '@/types/normalized';
import { connectionsSchema, District, equipmentSchema, facilitiesSchema, Municipality, Parish, Stop } from '@tmlmobilidade/types';
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
		setFilterParish: (values: string[]) => void
	}
	data: {
		filtered: StopNormalized[]
		raw: Stop[]
	}
	filters: {
		Connections: string[]
		District: District[]
		Equipment: string[]
		Facilities: string[]
		Municipality: Municipality[]
		Parish: Parish[]
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
		setFilterFacilities(queryFacilities.length === 0 ? queryFacilities : facilitiesSchema.options);
		setFilterEquipment(queryEquipment.length === 0 ? queryEquipment : equipmentSchema.options);
		setFilterConnections(queryConnections.length === 0 ? queryConnections : connectionsSchema.options);
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
		if (queryFacilities.length === 0 && queryEquipment.length === 0 && queryConnections.length === 0) return searchResultsData;

		// 1. Convert filter arrays to sets for O(1) membership checks
		const filterFacilitiesSet = new Set(filterFacilities);
		const filterEquipmentSet = new Set(filterEquipment);
		const filterConnectionsSet = new Set(filterConnections);

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
			return true;
		});
	}, [searchResultsData, filterFacilities, filterEquipment, filterConnections, queryConnections, queryEquipment, queryFacilities]);

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
	// E. render compose

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
				Connections: filterConnections,
				District: [],
				Equipment: filterEquipment,
				Facilities: filterFacilities,
				Municipality: [],
				Parish: [],
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
