'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
/* * */

import { ApiResponse, type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/types';
import { createContext, useContext, useMemo } from 'react';
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
		districts: District[]
		localitites: Locality[]
		municipalities: Municipality[]
		parishes: Parish[]
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

export const LocationsContextProvider = ({ children }) => {
	//

	//
	// A. Fetch data

	const { data: fetchedDistrictsData, isLoading: fetchedDistrictsLoading } = useSWR<ApiResponse<District[]>, Error>(`${API_ROUTES.locations.LOCATIONS_DISTRICTS}`, { refreshInterval: 900000 }); // 15 minutes
	const { data: fetchedMunicipalitiesData, isLoading: fetchedMunicipalitiesLoading } = useSWR<ApiResponse<Municipality[]>, Error>(`${API_ROUTES.locations.LOCATIONS_MUNICIPALITIES}`, { refreshInterval: 900000 }); // 15 minutes
	const { data: fetchedParishesData, isLoading: fetchedParishesLoading } = useSWR<ApiResponse<Parish[]>, Error>(`${API_ROUTES.locations.LOCATIONS_PARISHES}`, { refreshInterval: 900000 }); // 15 minutes
	const { data: fetchedLocalitiesData, isLoading: fetchedLocalitiesLoading } = useSWR<ApiResponse<Locality[]>, Error>(`${API_ROUTES.locations.LOCATIONS_LOCALITIES}`, { refreshInterval: 900000 }); // 15 minutes

	//
	// B. Transform data

	const allDistrictsData = useMemo(() => {
		if (fetchedDistrictsData?.status_code !== '200') return [];
		return fetchedDistrictsData.data;
	}, [fetchedDistrictsData]);

	const allMunicipalitiesData = useMemo(() => {
		if (fetchedMunicipalitiesData?.status_code !== '200') return [];
		return fetchedMunicipalitiesData.data;
	}, [fetchedMunicipalitiesData]);

	const allParishesData = useMemo(() => {
		if (fetchedParishesData?.status_code !== '200') return [];
		return fetchedParishesData.data;
	}, [fetchedParishesData]);

	const allLocalitiesData = useMemo(() => {
		if (fetchedLocalitiesData?.status_code !== '200') return [];
		return fetchedLocalitiesData.data;
	}, [fetchedLocalitiesData]);

	//
	// C. Handle actions

	const getDistrictById = (districtId: string): District | undefined => {
		return allDistrictsData.find(item => item._id === districtId);
	};

	const getMunicipalityById = (municipalityId: string): Municipality | undefined => {
		return allMunicipalitiesData.find(item => item._id === municipalityId);
	};

	const getParishById = (parishId: string): Parish | undefined => {
		return allParishesData.find(item => item._id === parishId);
	};

	const getLocalityById = (localityId: string): Locality | undefined => {
		return allLocalitiesData?.find(item => item._id === localityId);
	};

	//
	// D. Define context value

	const contextValue: LocationsContextState = {
		actions: {
			getDistrictById,
			getLocalityById,
			getMunicipalityById,
			getParishById,
		},
		data: {
			districts: allDistrictsData || [],
			localitites: allLocalitiesData || [],
			municipalities: allMunicipalitiesData || [],
			parishes: allParishesData || [],
		},
		flags: {
			is_loading: fetchedDistrictsLoading || fetchedMunicipalitiesLoading || fetchedParishesLoading || fetchedLocalitiesLoading,
		},
	};

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
