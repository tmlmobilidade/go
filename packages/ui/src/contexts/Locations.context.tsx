'use client';

import { type District, type Locality, type Municipality, type Parish } from '@carrismetropolitana/api-types/locations';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Location, Zone } from '@tmlmobilidade/types';
import { fetchData, HttpResponse, unauthenticatedSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

type DistrictsMap = Map<District['id'], District>;
type MunicipalitiesMap = Map<Municipality['id'], Municipality>;
type ParishesMap = Map<Parish['id'], Parish>;
type LocalitiesMap = Map<Locality['id'], Locality>;
type ZonesMap = Map<Zone['_id'], Zone>;

interface LocationsContextState {
	actions: {
		getDistrict: (districtId: string) => District | undefined
		getLocality: (localityId: string) => Locality | undefined
		getMunicipality: (municipalityId: string) => Municipality | undefined
		getParish: (parishId: string) => Parish | undefined
		getZone: (zoneId: string) => undefined | Zone
		queryLocations: (latitude: number, longitude: number) => Promise<Location | null>
	}
	data: {
		districts: DistrictsMap
		localities: LocalitiesMap
		municipalities: MunicipalitiesMap
		parishes: ParishesMap
		zones: ZonesMap
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

export const LocationsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Fetch data

	const { data: allDistrictsData, isLoading: allDistrictsLoading } = useSWR<District[], Error>(API_ROUTES.locations.LOCATIONS_DISTRICTS, unauthenticatedSwrFetcher);
	const { data: allMunicipalitiesData, isLoading: allMunicipalitiesLoading } = useSWR<Municipality[], Error>(API_ROUTES.locations.LOCATIONS_MUNICIPALITIES, unauthenticatedSwrFetcher);
	const { data: allParishesData, isLoading: allParishesLoading } = useSWR<Parish[], Error>(API_ROUTES.locations.LOCATIONS_PARISHES, unauthenticatedSwrFetcher);
	const { data: allLocalitiesData, isLoading: allLocalitiesLoading } = useSWR<Locality[], Error>(API_ROUTES.locations.LOCATIONS_LOCALITIES, unauthenticatedSwrFetcher);
	const { data: allZonesData, isLoading: allZonesLoading } = useSWR<Zone[], Error>(API_ROUTES.offer.ZONES_LIST);

	//
	// B. Transform data

	const districtsMap = useMemo(() => new Map(allDistrictsData?.map(item => [item.id, item]) ?? []), [allDistrictsData]);
	const municipalitiesMap = useMemo(() => new Map(allMunicipalitiesData?.map(item => [item.id, item]) ?? []), [allMunicipalitiesData]);
	const parishesMap = useMemo(() => new Map(allParishesData?.map(item => [item.id, item]) ?? []), [allParishesData]);
	const localitiesMap = useMemo(() => new Map(allLocalitiesData?.map(item => [item.id, item]) ?? []), [allLocalitiesData]);
	const zonesMap = useMemo(() => new Map(allZonesData?.map(item => [item._id, item]) ?? []), [allZonesData]);

	//
	// C. Handle actions

	const getDistrict = useCallback((id: District['id']): District | undefined => districtsMap.get(id), [districtsMap]);
	const getLocality = useCallback((id: Locality['id']): Locality | undefined => localitiesMap.get(id), [localitiesMap]);
	const getMunicipality = useCallback((id: Municipality['id']): Municipality | undefined => municipalitiesMap.get(id), [municipalitiesMap]);
	const getParish = useCallback((id: Parish['id']): Parish | undefined => parishesMap.get(id), [parishesMap]);
	const getZone = useCallback((id: Zone['_id']): undefined | Zone => zonesMap.get(id), [zonesMap]);

	const queryLocations = useCallback(async (latitude: number, longitude: number) => {
		const response = await fetchData<Location>(`${API_ROUTES.locations.LOCATIONS_COORDINATES}?lat=${latitude}&lon=${longitude}`);
		return response.data ?? null;
	}, []);

	//
	// D. Define context value

	const contextValue: LocationsContextState = useMemo(() => ({
		actions: {
			getDistrict,
			getLocality,
			getMunicipality,
			getParish,
			getZone,
			queryLocations,
		},
		data: {
			districts: districtsMap,
			localities: localitiesMap,
			municipalities: municipalitiesMap,
			parishes: parishesMap,
			zones: zonesMap,
		},
		flags: {
			is_loading: allDistrictsLoading || allMunicipalitiesLoading || allParishesLoading || allLocalitiesLoading || allZonesLoading,
		},
	}), [getDistrict, getLocality, getMunicipality, getParish, getZone, queryLocations, districtsMap, localitiesMap, municipalitiesMap, parishesMap, zonesMap, allDistrictsLoading, allMunicipalitiesLoading, allParishesLoading, allLocalitiesLoading, allZonesLoading]);

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
