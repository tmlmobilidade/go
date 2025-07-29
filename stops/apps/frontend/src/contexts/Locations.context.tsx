'use client';

/* * */

import { getAppConfig } from '@tmlmobilidade/lib';
import {
	type District,
	type Location,
	type Municipality,
	type Parish,
} from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface LocationsContextState {
	actions: {
		setDistrict: (districtId: string) => void
		setMunicipality: (municipalityId: string) => void
	}
	data: {
		districts: District[]
		municipalities: Municipality[]
		parishes: Parish[]
		selectedLocation: Partial<Location>
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

	const [selectedLocation, setSelectedLocation] = useState<LocationsContextState['data']['selectedLocation']>({});
	const [allMunicipalitiesData, setAllMunicipalitiesData] = useState<Municipality[]>([]);
	const [allParishesData, setAllParishesData] = useState<Parish[]>([]);

	const { data: allDistrictsData, isLoading: fetchedDistrictsLoading } = useSWR<HttpResponse<District[]>, Error>(`${getAppConfig('locations', 'api_url', 'production')}/locations/districts`);

	//

	//
	// B. Handle actions

	async function setDistrict(districtId: string) {
		selectedLocation.district = allDistrictsData?.data.find(item => item._id === districtId);
		setSelectedLocation(selectedLocation);

		const res = await fetchData<Municipality[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/municipalities?district_id=${selectedLocation.district._id}`);
		console.log('====> Res', res);

		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllMunicipalitiesData(res.data);
	};

	async function setMunicipality(municipalityId: string) {
		selectedLocation.municipality = allMunicipalitiesData.find(item => item._id === municipalityId);
		setSelectedLocation(selectedLocation);

		const res = await fetchData<Parish[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/parishes?municipality_id=${selectedLocation.municipality._id}`);
		console.log('------>', res);
		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllParishesData(res.data);
	}

	//

	//
	// C. Define context value

	const contextValue: LocationsContextState = useMemo(() => {
		return {

			actions: {
				setDistrict,
				setMunicipality,
			},
			data: {
				districts: allDistrictsData?.data ?? [],
				municipalities: allMunicipalitiesData,
				parishes: allParishesData,
				selectedLocation,

			},
			flags: {
				is_loading: fetchedDistrictsLoading,
			},
		};
	}, [selectedLocation, allDistrictsData, allMunicipalitiesData, allParishesData]);

	//

	//
	// D. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
