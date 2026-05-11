'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type District, type Locality, type Location, type Municipality, type Parish } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

// const AML_DISTRICT_IDS = ['11', '15'];

/* * */

interface LocationsContextState {
	actions: {
		queryLocations: (latitude: number, longitude: number) => Promise<Location | null>
	}
	data: {
		district_ids: string[]
		districts: District[]
		districts_map: Map<string, District>
		localities: Locality[]
		localities_map: Map<string, Locality>
		locality_ids: string[]
		municipalities: Municipality[]
		municipalities_map: Map<string, Municipality>
		municipality_ids: string[]
		parish_ids: string[]
		parishes: Parish[]
		parishes_map: Map<string, Parish>
	}
	flags: {
		error: Error | null
		loading: boolean
	}
}

/* * */

const LocationsContext = createContext<LocationsContextState | undefined>(undefined);

export function useLocationsContext() {
	const context = useContext(LocationsContext);
	if (!context) {
		throw new Error('useLocationsContext must be used within a LocationsContextProvider');
	}
	return context;
}

/* * */

export const LocationsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const [isLoading, setIsLoading] = useState(false);

	const allDistrictsMap = useRef<Map<string, District>>(new Map());
	const allMunicipalitiesMap = useRef<Map<string, Municipality>>(new Map());
	const allParishesMap = useRef<Map<string, Parish>>(new Map());
	const allLocalitiesMap = useRef<Map<string, Locality>>(new Map());

	//
	// B. Fetch data

	const { data: allDistrictsData, error: allDistrictsError, isLoading: allDistrictsLoading } = useSWR<District[]>(`${API_ROUTES.locations.LOCATIONS_DISTRICTS}?limit=999999`);
	const { data: allMunicipalitiesData, error: allMunicipalitiesError, isLoading: allMunicipalitiesLoading } = useSWR<Municipality[]>(`${API_ROUTES.locations.LOCATIONS_MUNICIPALITIES}?limit=999999`);
	const { data: allParishesData, error: allParishesError, isLoading: allParishesLoading } = useSWR<Parish[]>(`${API_ROUTES.locations.LOCATIONS_PARISHES}?limit=999999`);
	const { data: allLocalitiesData, error: allLocalitiesError, isLoading: allLocalitiesLoading } = useSWR<Locality[]>(`${API_ROUTES.locations.LOCATIONS_LOCALITIES}?limit=999999`);

	//
	// C. Transform data

	useEffect(() => {
		allDistrictsData?.forEach(item => allDistrictsMap.current.set(item._id, item));
	}, [allDistrictsData]);

	useEffect(() => {
		allMunicipalitiesData?.forEach(item => allMunicipalitiesMap.current.set(item._id, item));
	}, [allMunicipalitiesData]);

	useEffect(() => {
		allParishesData?.forEach(item => allParishesMap.current.set(item._id, item));
	}, [allParishesData]);

	useEffect(() => {
		allLocalitiesData?.forEach(item => allLocalitiesMap.current.set(item._id, item));
	}, [allLocalitiesData]);

	//
	// D. Handle actions

	const queryLocations = async (latitude: number, longitude: number) => {
		setIsLoading(true);
		const result = await fetchData<Location>(`${API_ROUTES.locations.LOCATIONS_COORDINATES}?lat=${latitude}&lon=${longitude}`);
		setIsLoading(false);
		return result.data ?? null;
	};

	//
	// E. Define context value

	const contextValue: LocationsContextState = useMemo(() => ({
		actions: {
			queryLocations,
		},
		data: {
			district_ids: Array.from(allDistrictsMap.current.keys()),
			districts: allDistrictsData ?? [],
			districts_map: allDistrictsMap.current,
			localities: allLocalitiesData ?? [],
			localities_map: allLocalitiesMap.current,
			locality_ids: Array.from(allLocalitiesMap.current.keys()),
			municipalities: allMunicipalitiesData ?? [],
			municipalities_map: allMunicipalitiesMap.current,
			municipality_ids: Array.from(allMunicipalitiesMap.current.keys()),
			parish_ids: Array.from(allParishesMap.current.keys()),
			parishes: allParishesData ?? [],
			parishes_map: allParishesMap.current,
		},
		flags: {
			error: allDistrictsError || allMunicipalitiesError || allParishesError || allLocalitiesError,
			loading: isLoading || allDistrictsLoading || allMunicipalitiesLoading || allParishesLoading || allLocalitiesLoading,
		},
	}), [
		allDistrictsData,
		allDistrictsMap.current,
		allMunicipalitiesData,
		allMunicipalitiesMap.current,
		allParishesData,
		allParishesMap.current,
		allLocalitiesData,
		allLocalitiesMap.current,
	]);

	//
	// F. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
