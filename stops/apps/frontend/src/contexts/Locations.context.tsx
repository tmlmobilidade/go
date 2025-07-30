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
		setDistrict: (districtId: string | string[]) => void
		setMunicipality: (municipalityId: string | string[]) => void
		setParish: (Parish: string | string[]) => void
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

	async function setDistrict(districtId: string) {
		const district = allDistrictsData?.data.find(item => item._id === districtId);
		console.log('------->', districtId);
		if (!district) return;

		setSelectedLocation({
			districts: [district],
			municipalities: [],
			parishes: [],
		});

		console.log('set --->', selectedLocation.districts);

		const res = await fetchData<Municipality[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/municipalities?district_ids=${selectedLocation.districts.map(item => item._id).join(',')}`);

		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllMunicipalitiesData(res.data);
		setAllParishesData([]);
		setAllLocalitiesData([]);
	};

	async function setMunicipality(municipalityId: string) {
		const municipality = allMunicipalitiesData.find(item => item._id === municipalityId);
		if (!selectedLocation.districts || !selectedLocation.municipalities) return;

		setSelectedLocation(prev => ({
			...prev,
			municipalities: [municipality],
			parishes: [],
		}));

		const res = await fetchData<Parish[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/parishes?municipality_ids=${selectedLocation.municipalities.map(item => item._id).join(',')}`);

		if (res.error) {
			console.error(res.error);
			return;
		}

		setAllParishesData(res.data);
		setAllLocalitiesData([]);
	}

	async function setParish(parishId: string) {
		const parish = allLocalitiesData.find(item => item._id === parishId);
		if (!selectedLocation.districts || !selectedLocation.municipalities || !selectedLocation.parishes) return;

		setSelectedLocation(prev => ({
			...prev,
			parishes: [parish],
		}));

		const res = await fetchData<Locality[]>(`${getAppConfig('locations', 'api_url', 'production')}/locations/localities?parish_ids=${selectedLocation.parishes.map(item => item._id).join(',')}`);
		console.log('localities ------>', res);
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
				setDistrict,
				setMunicipality,
				setParish,
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
