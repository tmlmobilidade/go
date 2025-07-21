'use client';

/* * */

import type { Municipality } from '@carrismetropolitana/api-types/locations';

import { Routes } from '@/lib/routes';
import { ApiResponse } from '@carrismetropolitana/api-types/common';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LocationsContextState {
	actions: {
		getZones: () => Promise<Municipality[]>
	}
	data: {
		zones: {
			id: string
			municipality: Municipality
		}[]
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

	const { data: zonesData, isLoading: fetchedZonesLoading } = useSWR<ApiResponse<Municipality[]>, Error>(`${Routes.API}/stops/zones`);

	//
	// B. Transform data

	const allZonesData = useMemo(() => {
		if (zonesData?.status !== 'success') return [];

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

		return zonesData.data
			.filter(municipality => AML.includes(municipality.name))
			.sort((a, b) => a.name.localeCompare(b.name))
			.map(municipality => ({
				id: municipality.id,
				municipality,
			}));
	}, [zonesData]);

	//
	// C. Handle actions

	const getZones = async (): Promise<Municipality[]> => {
		return allZonesData.map(zone => zone.municipality);
	};

	//
	// D. Define context value

	const contextValue: LocationsContextState = useMemo(() => {
		return {
			actions: {
				getZones,
			},
			data: {
				zones: allZonesData,
			},
			flags: {
				is_loading: fetchedZonesLoading,
			},
		};
	}, [allZonesData, fetchedZonesLoading]);

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
