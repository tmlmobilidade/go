'use client';

/* * */

import type { District, Locality, Municipality, Parish } from '@carrismetropolitana/api-types/locations';

import { Routes } from '@/lib/routes';
import { ApiResponse } from '@carrismetropolitana/api-types/common';
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
		district_ids: District['id'][]
		districts: District[]
		localitites: Locality[]
		locality_ids: Locality['id'][]
		municipalities: Municipality[]
		municipality_ids: Municipality['id'][]
		parish_ids: Parish['id'][]
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

export const LocationsContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: fetchedDistrictsData, isLoading: fetchedDistrictsLoading } = useSWR<ApiResponse<District[]>, Error>(`${Routes.CMET_API}/locations/districts`);
	const { data: fetchedMunicipalitiesData, isLoading: fetchedMunicipalitiesLoading } = useSWR<ApiResponse<Municipality[]>, Error>(`${Routes.CMET_API}/locations/municipalities`);
	const { data: fetchedParishesData, isLoading: fetchedParishesLoading } = useSWR<ApiResponse<Parish[]>, Error>(`${Routes.CMET_API}/locations/parishes`);
	const { data: fetchedLocalitiesData, isLoading: fetchedLocalitiesLoading } = useSWR<ApiResponse<Locality[]>, Error>(`${Routes.CMET_API}/locations/localities`);

	//
	// B. Transform data

	const allDistrictsData = useMemo(() => {
		if (fetchedDistrictsData?.status !== 'success') return [];
		return fetchedDistrictsData.data;
	}, [fetchedDistrictsData]);

	const allMunicipalitiesData = useMemo(() => {
		if (fetchedMunicipalitiesData?.status !== 'success') return [];

		const AML = [
			'Alcochete',
			'Almada',
			'Amadora',
			'Barreiro',
			'Cascais',
			'Lisboa',
			'Loures',
			'Mafra',
			'Moita',
			'Montijo',
			'Odivelas',
			'Oeiras',
			'Palmela',
			'Seixal',
			'Sesimbra',
			'Setúbal',
			'Sintra',
			'Vila Franca de Xira',
		];

		return fetchedMunicipalitiesData.data.filter(municipality => AML.includes(municipality.name)).sort((a, b) => a.name.localeCompare(b.name));
	}, [fetchedMunicipalitiesData]);

	const allParishesData = useMemo(() => {
		if (fetchedParishesData?.status !== 'success') return [];
		return fetchedParishesData.data;
	}, [fetchedParishesData]);

	const allLocalitiesData = useMemo(() => {
		if (fetchedLocalitiesData?.status !== 'success') return [];
		return fetchedLocalitiesData.data;
	}, [fetchedLocalitiesData]);

	//
	// C. Handle actions

	const getDistrictById = (districtId: string): District | undefined => {
		return allDistrictsData.find(item => item.id === districtId);
	};

	const getMunicipalityById = (municipalityId: string): Municipality | undefined => {
		return allMunicipalitiesData.find(item => item.id === municipalityId);
	};

	const getParishById = (parishId: string): Parish | undefined => {
		return allParishesData.find(item => item.id === parishId);
	};

	const getLocalityById = (localityId: string): Locality | undefined => {
		return allLocalitiesData?.find(item => item.id === localityId);
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
			district_ids: allDistrictsData.map(item => item.id) || [],
			districts: allDistrictsData || [],
			localitites: allLocalitiesData || [],
			locality_ids: allLocalitiesData.map(item => item.id) || [],
			municipalities: allMunicipalitiesData || [],
			municipality_ids: allMunicipalitiesData.map(item => item.id) || [],
			parish_ids: allParishesData.map(item => item.id) || [],
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
