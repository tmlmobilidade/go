'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type District, type Locality, type Location, type Municipality, type Parish } from '@tmlmobilidade/types';
import { fetchData, unauthenticatedSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

type DistrictsMap = Map<District['_id'], District>;
type MunicipalitiesMap = Map<Municipality['_id'], Municipality>;
type ParishesMap = Map<Parish['_id'], Parish>;
type LocalitiesMap = Map<Locality['_id'], Locality>;

interface LocationsContextState {
	actions: {
		getDistrict: (districtId: string) => District | undefined
		getLocality: (localityId: string) => Locality | undefined
		getMunicipality: (municipalityId: string) => Municipality | undefined
		getParish: (parishId: string) => Parish | undefined
		queryLocation: (latitude: number, longitude: number) => Promise<Location | null>
	}
	data: {
		districts: DistrictsMap
		localities: LocalitiesMap
		municipalities: MunicipalitiesMap
		parishes: ParishesMap
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

	const { data: allDistrictsData, isLoading: allDistrictsLoading } = useSWR<District[], Error>(API_ROUTES.locations.LOCATIONS_DISTRICTS, unauthenticatedSwrFetcher, { refreshInterval: Infinity });
	const { data: allMunicipalitiesData, isLoading: allMunicipalitiesLoading } = useSWR<Municipality[], Error>(API_ROUTES.locations.LOCATIONS_MUNICIPALITIES, unauthenticatedSwrFetcher, { refreshInterval: Infinity });
	const { data: allParishesData, isLoading: allParishesLoading } = useSWR<Parish[], Error>(API_ROUTES.locations.LOCATIONS_PARISHES, unauthenticatedSwrFetcher, { refreshInterval: Infinity });
	const { data: allLocalitiesData, isLoading: allLocalitiesLoading } = useSWR<Locality[], Error>(API_ROUTES.locations.LOCATIONS_LOCALITIES, unauthenticatedSwrFetcher, { refreshInterval: Infinity });

	//
	// B. Transform data

	const districtsMap = useMemo(() => new Map(allDistrictsData?.map(item => [item._id, item]) ?? []), [allDistrictsData]);
	const municipalitiesMap = useMemo(() => new Map(allMunicipalitiesData?.map(item => [item._id, item]) ?? []), [allMunicipalitiesData]);
	const parishesMap = useMemo(() => new Map(allParishesData?.map(item => [item._id, item]) ?? []), [allParishesData]);
	const localitiesMap = useMemo(() => new Map(allLocalitiesData?.map(item => [item._id, item]) ?? []), [allLocalitiesData]);

	//
	// C. Handle actions

	const getDistrict = useCallback((id: District['_id']): District | undefined => districtsMap.get(id), [districtsMap]);
	const getLocality = useCallback((id: Locality['_id']): Locality | undefined => localitiesMap.get(id), [localitiesMap]);
	const getMunicipality = useCallback((id: Municipality['_id']): Municipality | undefined => municipalitiesMap.get(id), [municipalitiesMap]);
	const getParish = useCallback((id: Parish['_id']): Parish | undefined => parishesMap.get(id), [parishesMap]);
	const queryLocation = useCallback(async (latitude: number, longitude: number) => {
		const response = await fetchData<Location>(`${API_ROUTES.locations.LOCATIONS_LOCATION}?lat=${latitude}&lon=${longitude}`);
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
			queryLocation,
		},
		data: {
			districts: districtsMap,
			localities: localitiesMap,
			municipalities: municipalitiesMap,
			parishes: parishesMap,
		},
		flags: {
			is_loading: allDistrictsLoading || allMunicipalitiesLoading || allParishesLoading || allLocalitiesLoading,
		},
	}), [getDistrict, getLocality, getMunicipality, getParish, queryLocation, districtsMap, localitiesMap, municipalitiesMap, parishesMap, allDistrictsLoading, allMunicipalitiesLoading, allParishesLoading, allLocalitiesLoading]);

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
