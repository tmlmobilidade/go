'use client';

/* * */

import { getAppConfig } from '@tmlmobilidade/lib';
import { type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';

/* * */

// const AML_DISTRICT_IDS = ['11', '15'];

/* * */

interface LocationsContextState {
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

	const allDistrictsMap = useRef<Map<string, District>>(new Map());
	const allMunicipalitiesMap = useRef<Map<string, Municipality>>(new Map());
	const allParishesMap = useRef<Map<string, Parish>>(new Map());
	const allLocalitiesMap = useRef<Map<string, Locality>>(new Map());

	//
	// A. Fetch data

	const { data: allDistrictsData, error: allDistrictsError, isLoading: allDistrictsLoading } = useSWR<District[]>(`${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/districts?limit=999999`, swrFetcher);
	const { data: allMunicipalitiesData, error: allMunicipalitiesError, isLoading: allMunicipalitiesLoading } = useSWR<Municipality[]>(`${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/municipalities?limit=999999`, swrFetcher);
	const { data: allParishesData, error: allParishesError, isLoading: allParishesLoading } = useSWR<Parish[]>(`${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/parishes?limit=999999`, swrFetcher);
	const { data: allLocalitiesData, error: allLocalitiesError, isLoading: allLocalitiesLoading } = useSWR<Locality[]>(`${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/localities?limit=999999`, swrFetcher);

	//
	// B. Transform data

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
	// C. Define context value

	const contextValue: LocationsContextState = useMemo(() => ({
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
			loading: allDistrictsLoading || allMunicipalitiesLoading || allParishesLoading || allLocalitiesLoading,
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
	// D. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
