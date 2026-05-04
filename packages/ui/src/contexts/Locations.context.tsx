'use client';

/* * */

import { ApiResponse } from '@carrismetropolitana/api-types/common';
import { type District, type Locality, type Municipality, type Parish } from '@carrismetropolitana/api-types/locations';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { normalizeString } from '@tmlmobilidade/strings';
import { Zone } from '@tmlmobilidade/types';
import { standardSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LocationsContextState {
	actions: {
		getDistrictById: (districtId: string) => District | undefined
		getLocalityById: (localityId: string) => Locality | undefined
		getMunicipalityById: (municipalityId: string) => Municipality | undefined
		getParishById: (parishId: string) => Parish | undefined
	}
	data: {
		district_ids: District['id'][]
		districts: District[]
		districts_map: Map<District['id'], District & { name_normalized: string }>
		localitites: Locality[]
		localitites_map: Map<Locality['id'], Locality & { name_normalized: string }>
		locality_ids: Locality['id'][]
		municipalities: Municipality[]
		municipalities_map: Map<Municipality['id'], Municipality & { name_normalized: string }>
		municipality_ids: Municipality['id'][]
		parish_ids: Parish['id'][]
		parishes: Parish[]
		parishes_map: Map<Parish['id'], Parish & { name_normalized: string }>
		zone_ids: Zone['_id'][]
		zones: Zone[]
		zones_map: Map<Zone['_id'], Zone & { name_normalized: string }>
	}
	flags: {
		is_loading: boolean
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

const CMET_API = process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2';

export const LocationsContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: fetchedDistrictsData, isLoading: fetchedDistrictsLoading } = useSWR<ApiResponse<District[]>, Error>(`${CMET_API}/locations/districts`, standardSwrFetcher);
	const { data: fetchedMunicipalitiesData, isLoading: fetchedMunicipalitiesLoading } = useSWR<ApiResponse<Municipality[]>, Error>(`${CMET_API}/locations/municipalities`, standardSwrFetcher);
	const { data: fetchedParishesData, isLoading: fetchedParishesLoading } = useSWR<ApiResponse<Parish[]>, Error>(`${CMET_API}/locations/parishes`, standardSwrFetcher);
	const { data: fetchedLocalitiesData, isLoading: fetchedLocalitiesLoading } = useSWR<ApiResponse<Locality[]>, Error>(`${CMET_API}/locations/localities`, standardSwrFetcher);
	const { data: allZonesData, isLoading: fetchedZonesLoading } = useSWR<Zone[], Error>(API_ROUTES.offer.ZONES_LIST);

	//
	// B. Transform data

	const allDistrictsData = useMemo(() => {
		if (fetchedDistrictsData?.status !== 'success') return [];
		return fetchedDistrictsData.data;
	}, [fetchedDistrictsData]);

	const allDistrictsMap = useMemo(() => {
		return new Map(allDistrictsData.map(item => [item.id, { ...item, name_normalized: normalizeString(item.name) }]));
	}, [allDistrictsData]);

	const allDistrictIds = useMemo(() => {
		return allDistrictsData.map(item => item.id);
	}, [allDistrictsData]);

	//

	const allMunicipalitiesData = useMemo(() => {
		if (fetchedMunicipalitiesData?.status !== 'success') return [];
		const AML = ['Alcochete', 'Almada', 'Amadora', 'Barreiro', 'Cascais', 'Lisboa', 'Loures', 'Mafra', 'Moita', 'Montijo', 'Odivelas', 'Oeiras', 'Palmela', 'Seixal', 'Sesimbra', 'Setúbal', 'Sintra', 'Vila Franca de Xira'];
		return fetchedMunicipalitiesData.data
			.filter(item => AML.includes(item.name))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [fetchedMunicipalitiesData]);

	const allMunicipalitiesMap = useMemo(() => {
		return new Map(allMunicipalitiesData.map(item => [item.id, { ...item, name_normalized: normalizeString(item.name) }]));
	}, [allMunicipalitiesData]);

	const allMunicipalityIds = useMemo(() => {
		return allMunicipalitiesData.map(item => item.id);
	}, [allMunicipalitiesData]);

	//

	const allParishesData = useMemo(() => {
		if (fetchedParishesData?.status !== 'success') return [];
		return fetchedParishesData.data;
	}, [fetchedParishesData]);

	const allParishesMap = useMemo(() => {
		return new Map(allParishesData.map(item => [item.id, { ...item, name_normalized: normalizeString(item.name) }]));
	}, [allParishesData]);

	const allParishIds = useMemo(() => {
		return allParishesData.map(item => item.id);
	}, [allParishesData]);

	//

	const allLocalitiesData = useMemo(() => {
		if (fetchedLocalitiesData?.status !== 'success') return [];
		return fetchedLocalitiesData.data;
	}, [fetchedLocalitiesData]);

	const allLocalitiesMap = useMemo(() => {
		return new Map(allLocalitiesData.map(item => [item.id, { ...item, name_normalized: normalizeString(item.name) }]));
	}, [allLocalitiesData]);

	const allLocalityIds = useMemo(() => {
		return allLocalitiesData.map(item => item.id);
	}, [allLocalitiesData]);

	//

	const allZonesMap = useMemo(() => {
		return new Map(allZonesData?.map(item => [item._id, { ...item, name_normalized: normalizeString(item.name) }]));
	}, [allZonesData]);

	const allZoneIds = useMemo(() => {
		return allZonesData?.map(item => item._id) ?? [];
	}, [allZonesData]);

	//
	// C. Handle actions

	const getDistrictById = useCallback((districtId: string): District | undefined => {
		return allDistrictsData.find(item => item.id === districtId);
	}, [allDistrictsData]);

	const getMunicipalityById = useCallback((municipalityId: string): Municipality | undefined => {
		return allMunicipalitiesData.find(item => item.id === municipalityId);
	}, [allMunicipalitiesData]);

	const getParishById = useCallback((parishId: string): Parish | undefined => {
		return allParishesData.find(item => item.id === parishId);
	}, [allParishesData]);

	const getLocalityById = useCallback((localityId: string): Locality | undefined => {
		return allLocalitiesData?.find(item => item.id === localityId);
	}, [allLocalitiesData]);

	//
	// D. Define context value

	const contextValue: LocationsContextState = useMemo(() => ({
		actions: {
			getDistrictById,
			getLocalityById,
			getMunicipalityById,
			getParishById,
		},
		data: {
			district_ids: allDistrictIds ?? [],
			districts: allDistrictsData ?? [],
			districts_map: allDistrictsMap || new Map(),
			localitites: allLocalitiesData ?? [],
			localitites_map: allLocalitiesMap || new Map(),
			locality_ids: allLocalityIds ?? [],
			municipalities: allMunicipalitiesData ?? [],
			municipalities_map: allMunicipalitiesMap || new Map(),
			municipality_ids: allMunicipalityIds ?? [],
			parish_ids: allParishIds ?? [],
			parishes: allParishesData ?? [],
			parishes_map: allParishesMap || new Map(),
			zone_ids: allZoneIds ?? [],
			zones: allZonesData ?? [],
			zones_map: allZonesMap || new Map(),
		},
		flags: {
			is_loading: fetchedDistrictsLoading || fetchedMunicipalitiesLoading || fetchedParishesLoading || fetchedLocalitiesLoading || fetchedZonesLoading,
		},
	}), [getDistrictById, getLocalityById, getMunicipalityById, getParishById, allDistrictIds, allDistrictsData, allDistrictsMap, allLocalitiesData, allLocalitiesMap, allLocalityIds, allMunicipalitiesData, allMunicipalitiesMap, allMunicipalityIds, allParishIds, allParishesData, allParishesMap, allZoneIds, allZonesData, allZonesMap, fetchedDistrictsLoading, fetchedMunicipalitiesLoading, fetchedParishesLoading, fetchedLocalitiesLoading, fetchedZonesLoading]);

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
