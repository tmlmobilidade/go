'use client';

/* * */

import { getAppConfig } from '@tmlmobilidade/lib';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface LocationsContextState {
	actions: {
		getDistrict: () => []
		getMunicipality: () => []
		getParish: () => []
	}
	data: {
		district: string[]
		municipality: string[]
		parish: string[]
	}
	filters: {
		filterDistrict: string[]
		filterMunicipality: string[]
		filterParish: string[]
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

	//
	// A. Fetch data

	const { data: districtData, isLoading: fetcheddistrictLoading } = useSWR(`${getAppConfig('locations', 'api_url', 'production')}/locations/districts`, swrFetcher);

	//
	// B. Transform data

	console.log('districtData -> ', districtData);
	console.log('isloading -> ', fetcheddistrictLoading);

	//
	// C. Handle actions

	const getDistrict = async () => {
		return districtData;
	};

	const getMunicipality = async () => {
		return districtData;
	};

	const getParish = async () => {
		return districtData;
	};

	//
	// D. Define context value

	const contextValue: LocationsContextState = useMemo(() => {
		return {
			actions: {
				getDistrict,
				getMunicipality,
				getParish,
			},
			data: {
				district: districtData,
				municipality: districtData,
				parish: districtData,
			},
			filters: {
				filterDistrict: districtData,
				filterMunicipality: districtData,
				filterParish: districtData,
			},
			flags: {
				is_loading: fetcheddistrictLoading,
			},
		};
	}, [districtData, fetcheddistrictLoading]);

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
