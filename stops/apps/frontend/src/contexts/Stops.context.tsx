'use client';

/* * */

import { getBaseGeoJsonFeatureCollection } from '@/utils/map.utils';
import { type Stop } from '@tmlmobilidade/types';
import { swrFetcher } from '@tmlmobilidade/utils';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

/* * */

interface StopsContextState {
	actions: {
		getStopById: (stopId: string) => Stop | undefined
		getStopByIdGeoJsonFC: (stopId: string) => GeoJSON.FeatureCollection | undefined
		handleDBSync: () => void
	}
	data: {
		stops: Stop[]
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

export const StopsContextProvider = ({ children }: { children: React.ReactNode }) => {
	//

	//
	// A. Fetch data

	const { data: allStopsData, isLoading: allStopsLoading } = useSWR<Stop[], Error>(`/api/stops`, swrFetcher);

	// const workerRef = useRef<null | Worker>(null);

	const [dataStopsState] = useState<StopsContextState['data']['stops']>([]);
	const [dataStopsFCState, setDataStopsFCState] = useState<StopsContextState['data']['stops_fc']>();
	// const { data: allStopsData, isLoading: allStopsLoading } = useSWR<Stop[], Error>(`${Routes.CMET_API}/stops`);

	// useEffect(() => {
	// 	// Check if all data is available
	// 	if (!allStopsData) return;
	// 	// Initialize worker if not already initialized
	// 	if (!workerRef.current) {
	// 		// workerRef.current = new Worker(new URL('../workers/extend-stops.worker.ts', import.meta.url));
	// 		workerRef.current.onmessage = (event: MessageEvent) => setDataStopsState(event.data);
	// 		workerRef.current.onerror = error => console.error('Worker error:', error);
	// 	}
	// 	// Extend data for worker and send message
	// 	const eventMessage = {
	// 		stops: allStopsData,
	// 	};
	// 	workerRef.current.postMessage(eventMessage);
	// 	// Cleanup worker
	// 	return () => {
	// 		workerRef.current?.terminate();
	// 		workerRef.current = null;
	// 	};
	// }, [allStopsData]);

	useEffect(() => {
		// Check if all data is available
		if (!dataStopsState) return;
		// Transform data into GeoJSON FeatureCollection
		const collection = getBaseGeoJsonFeatureCollection();
		dataStopsState.forEach((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			if (stopFC) collection.features.push(stopFC);
		});
		// Set state value
		setDataStopsFCState(collection);
		//
	}, [dataStopsState]);

	//
	// B. Handle actions

	const handleDBSync = () => {
		mutate('/api/stops'); // Invalidate cache
	};

	const getStopById = (stopId: string): Stop | undefined => {
		return allStopsData?.find(stop => stop._id === stopId);
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
	// C. Define context value

	const contextValue: StopsContextState = useMemo(() => {
		return {
			actions: {
				getStopById,
				getStopByIdGeoJsonFC,
				handleDBSync,
			},
			data: {
				stops: allStopsData || [],
				stops_fc: dataStopsFCState,
			},
			flags: {
				is_loading: allStopsLoading,
			},
		};
	}, [allStopsData, allStopsLoading, dataStopsFCState]);

	//
	// D. Render components

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);

	//
};

/* * */

export function transformStopDataIntoGeoJsonFeature(stopData: Stop): GeoJSON.Feature<GeoJSON.Point> {
	return {
		geometry: {
			coordinates: [stopData.longitude, stopData.latitude],
			type: 'Point',
		},
		properties: {
			current_status: stopData.operational_status,
			id: stopData._id,
			lat: stopData.latitude,
			lon: stopData.longitude,
			long_name: stopData.name,
		},
		type: 'Feature',
	};
}
