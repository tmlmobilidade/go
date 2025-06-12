'use client';

/* * */

import { transformStopDataIntoGeoJsonFeature } from '@/contexts/Stops.context';
import { swrFetcher } from '@/lib/http';
import { Stop } from '@tmlmobilidade/types';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/ui';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface StopsListContextState {
	actions: {
		handleDBSync?: () => void
	}
	data: {
		filtered_fc: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
		raw: Stop[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

/* * */

const StopsListContext = createContext<StopsListContextState | undefined>(undefined);

export const useStopsListContext = () => {
	const context = useContext(StopsListContext);
	if (!context) {
		throw new Error('useStopsListContext must be used within an StopsListContextProvider');
	}
	return context;
};

/* * */

export const StopsListContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Setup variables

	const [dataFilteredGeojsonFCState, setDataFilteredGeojsonFCState] = useState<GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>>(getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>);

	//
	// B. Fetch data

	const { data: allStopsData, error: allStopsError, isLoading: allStopsLoading } = useSWR<Stop[], Error>('/api/stops', swrFetcher);

	//
	// C. Transform data

	const handleDBSync = () => {
		mutate('/api/stops');
	};

	const rawStops = useMemo(() => {
		return allStopsData || [];
	}, [allStopsData]);

	const geoStops = useMemo(() => {
		return dataFilteredGeojsonFCState || (getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>);
	}, [dataFilteredGeojsonFCState]);

	useEffect(() => {
		if (!allStopsData) return;
		// Initialize worker if not already initialized
		const collection: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> = getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>;
		allStopsData.map((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			// console.log('stopFC', stopFC);
			if (stopFC) collection.features.push(stopFC);
		});
		// Set state value
		setDataFilteredGeojsonFCState(collection);
	}, [allStopsData]);

	//
	// E. Define context value

	const contextValue: StopsListContextState = useMemo(() => ({
		actions: {
			handleDBSync,
		},
		data: {
			// filtered: filteredAlerts || [],
			filtered_fc: geoStops || (getBaseGeoJsonFeatureCollection() as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>),
			raw: rawStops || [],
		},
		filters: {
		},
		flags: {
			error: allStopsError,
			isLoading: allStopsLoading,
		},
	}), [
		rawStops,
		geoStops,
		allStopsError,
		allStopsLoading,
	]);

	//
	// F. Render components

	return (
		<StopsListContext.Provider value={contextValue}>
			{children}
		</StopsListContext.Provider>
	);

	//
};
