'use client';

import { getPublicVariable } from '@/settings/public-variables';
import { type NetworkStop } from '@/types/api/network';
import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopsContextState {
	actions: {
		getStopById: (stopId: string) => NetworkStop | undefined
		getStopByIdGeoJsonFC: (stopId: string) => GeoJSON.FeatureCollection | undefined
	}
	data: {
		stops: NetworkStop[]
		stops_fc: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> | undefined
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const StopsContext = createContext<StopsContextState | undefined>(undefined);

export function useStopsContext() {
	const context = useContext(StopsContext);
	if (!context) {
		throw new Error('useStopsContext must be used within a StopsContextProvider');
	}
	return context;
}

/* * */

export const StopsContextProvider = ({ children }) => {
	//

	//
	// A. Setup variables

	const [dataStopsFCState, setDataStopsFCState] = useState<StopsContextState['data']['stops_fc']>();

	//
	// B. Fetch data

	const { data: allStopsData, isLoading: allStopsLoading } = useSWR<NetworkStop[]>(`${getPublicVariable('hub_api_url')}/v1/network/stops`, { refreshInterval: 900000 }); // 15 minutes

	//
	// C. Transform data

	useEffect(() => {
		// Check if all data is available
		if (!allStopsData) return;
		// Transform data into GeoJSON FeatureCollection
		const collection = getBaseGeoJsonFeatureCollection();
		allStopsData.forEach((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			if (stopFC) collection.features.push(stopFC);
		});
		// Set state value
		setDataStopsFCState(collection);
		//
	}, [allStopsData]);

	//
	// D. Handle actions

	const getStopById = (stopId: string): NetworkStop | undefined => {
		return allStopsData?.find(stop => stop.id === stopId);
	};

	const getStopByIdGeoJsonFC = (stopId: string): GeoJSON.FeatureCollection | undefined => {
		const stop = getStopById(stopId);
		if (!stop) return;
		const collection = getBaseGeoJsonFeatureCollection();
		const stopFC = transformStopDataIntoGeoJsonFeature(stop);
		if (stopFC) collection.features.push(stopFC);
		return collection;
	};

	//
	// E. Define context value

	const contextValue: StopsContextState = {
		actions: {
			getStopById,
			getStopByIdGeoJsonFC,
		},
		data: {
			stops: allStopsData ?? [],
			stops_fc: dataStopsFCState,
		},
		flags: {
			is_loading: allStopsLoading,
		},
	};

	//
	// F. Render components

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);

	//
};

/* * */

export function transformStopDataIntoGeoJsonFeature(stopData: NetworkStop): GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> {
	const feature: GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties> = {
		geometry: {
			coordinates: [stopData.lon, stopData.lat],
			type: 'Point',
		},
		properties: {
			current_status: stopData.operational_status,
			id: stopData.id,
			lat: stopData.lat,
			lon: stopData.lon,
			long_name: stopData.long_name,
		},
		type: 'Feature',
	};

	// Filter out falsy properties
	Object.keys(feature.properties).forEach((key) => {
		if (feature.properties[key as keyof typeof feature.properties] === undefined || feature.properties[key as keyof typeof feature.properties] === null) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete feature.properties[key as keyof typeof feature.properties];
		}
	});

	return feature;
}
