'use client';

/* * */

import { getAppConfig } from '@tmlmobilidade/lib';
import {
	type District,
	Locality,
	type Municipality,
	type Parish,
} from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
import { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface SelectedLocations {
	districts: District[]
	municipalities: Municipality[]
	parishes: Parish[]
}

interface LocationsContextState {
	actions: {
		setDistricts: (ids: string[]) => void
		setMunicipalities: (ids: string[]) => void
		setParishes: (ids: string[]) => void
	}
	data: {
		districts: District[]
		localities: Locality[]
		municipalities: Municipality[]
		parishes: Parish[]
		selectedLocation: SelectedLocations
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

	const [selectedLocation, setSelectedLocation] = useState<LocationsContextState['data']['selectedLocation']>({
		districts: [],
		municipalities: [],
		parishes: [],
	});
	const [allMunicipalitiesData, setAllMunicipalitiesData] = useState<Municipality[]>([]);
	const [allParishesData, setAllParishesData] = useState<Parish[]>([]);
	const [allLocalitiesData, setAllLocalitiesData] = useState<Locality[]>([]);

	const { data: allDistrictsData, isLoading: fetchedDistrictsLoading } = useSWR<HttpResponse<District[]>, Error>(`${getAppConfig('locations', 'api_url', 'production')}/locations/districts`);

	//

	//
	// B. Handle actions

	async function setDistricts(ids: string[]) {
		const districts = allDistrictsData.data.filter(item => ids.includes(item._id));

		setSelectedLocation({
			districts,
			municipalities: [],
			parishes: [],
		});

		const res = await fetchData<Municipality[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/municipalities?district_ids=${districts.map(item => item._id).join(',')}`);

		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllMunicipalitiesData(res.data);
		setAllParishesData([]);
		setAllLocalitiesData([]);
	}

	async function setMunicipalities(ids: string[]) {
		const municipalities = allMunicipalitiesData.filter(item => ids.includes(item._id));

		setSelectedLocation(prev => ({
			...prev,
			municipalities,
			parishes: [],
		}));

		const res = await fetchData<Parish[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/parishes?municipality_ids=${municipalities.map(item => item._id).join(',')}`);

		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllParishesData(res.data);
		setAllLocalitiesData([]);
	}

	async function setParishes(ids: string[]) {
		const parishes = allParishesData.filter(item => ids.includes(item._id));

		setSelectedLocation(prev => ({
			...prev,
			parishes,
		}));

		const res = await fetchData<Locality[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/localities?parish_ids=${parishes.map(item => item._id).join(',')}`);

		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllLocalitiesData(res.data);
	}

	//

	//
	// C. Define context value

	const contextValue: LocationsContextState = useMemo(() => {
		return {

			actions: {
				setDistricts,
				setMunicipalities,
				setParishes,
			},
			data: {
				districts: allDistrictsData?.data ?? [],
				localities: allLocalitiesData,
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
