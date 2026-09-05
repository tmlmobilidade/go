'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { fetchApiData } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsContextState {
	actions: {
		getStopById: (stopId: string) => HubV1ApiStop | undefined
		getStopByIdGeoJsonFC: (stopId: string) => GeoJSON.FeatureCollection | undefined
	}
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
		stops: HubV1ApiStop[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
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

export function StopsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allStopsData, isLoading: allStopsLoading } = useSWR(API_ROUTES.hub.NETWORK_STOPS, {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiStop[]>({ credentials: 'omit', url }),
	});

	//
	// B. Transform data

	const dataFeatureCollectionState = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		if (!allStopsData) return collection;
		allStopsData.data?.forEach((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			if (stopFC) collection.features.push(stopFC);
		});
		return collection;
	}, [allStopsData]);

	//
	// C. Handle actions

	const getStopById = (stopId: number | string): HubV1ApiStop | undefined => {
		return allStopsData?.data?.find(stop => String(stop._id) === String(stopId));
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
	// D. Define context value

	const contextValue: StopsContextState = {
		actions: {
			getStopById,
			getStopByIdGeoJsonFC,
		},
		data: {
			fc: dataFeatureCollectionState,
			stops: allStopsData?.data ?? [],
		},
		flags: {
			error: undefined,
			isLoading: allStopsLoading,
		},
	};

	//
	// E. Render components

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);
};

/* * */

export function transformStopDataIntoGeoJsonFeature(stopData: HubV1ApiStop): GeoJSON.Feature<GeoJSON.Point, HubV1ApiStop> {
	const feature: GeoJSON.Feature<GeoJSON.Point, HubV1ApiStop> = {
		geometry: {
			coordinates: [stopData.longitude, stopData.latitude],
			type: 'Point',
		},
		properties: stopData,
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
