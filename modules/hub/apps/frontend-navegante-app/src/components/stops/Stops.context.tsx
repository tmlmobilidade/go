'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubStop } from '@tmlmobilidade/go-types-public-info';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsContextState {
	actions: {
		getLegacyStopIds: (stopId: string) => string[]
		getStopById: (stopId: string) => HubStop | undefined
		getStopByIdGeoJsonFC: (stopId: string) => GeoJSON.FeatureCollection | undefined
	}
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
		legacyStopsMap: Map<string, string[]>
		stops: HubStop[]
	}
	flags: {
		error: Error | undefined
		isLoading: boolean
	}
}

interface LegacyStopsMapData {
	id: number
	legacy_ids: string[]
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

	const { data: allStopsData, isLoading: allStopsLoading } = useSWR<HubStop[]>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_STOPS }); // 15 minutes
	const { data: legacyStopsMapData, isLoading: legacyStopsMapLoading } = useSWR<LegacyStopsMapData[]>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_LEGACY_STOPS_MAP }); // 15 minutes

	//
	// B. Transform data

	const dataFeatureCollectionState = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection();
		if (!allStopsData) return collection;
		allStopsData.forEach((stop) => {
			const stopFC = transformStopDataIntoGeoJsonFeature(stop);
			if (stopFC) collection.features.push(stopFC);
		});
		return collection;
	}, [allStopsData]);

	const dataLegacyStopsMapState = useMemo(() => {
		const map = new Map<string, string[]>();
		legacyStopsMapData?.forEach((item) => {
			map.set(String(item.id), item.legacy_ids);
		});
		return map;
	}, [legacyStopsMapData]);

	//
	// D. Handle actions

	const getStopById = (stopId: number | string): HubStop | undefined => {
		return allStopsData?.find(stop => String(stop._id) === String(stopId));
	};

	const getStopByIdGeoJsonFC = (stopId: string): GeoJSON.FeatureCollection | undefined => {
		const stop = getStopById(stopId);
		if (!stop) return;
		const collection = getBaseGeoJsonFeatureCollection();
		const stopFC = transformStopDataIntoGeoJsonFeature(stop);
		if (stopFC) collection.features.push(stopFC);
		return collection;
	};

	const getLegacyStopIds = (stopId: string): string[] => {
		return dataLegacyStopsMapState.get(stopId) ?? [];
	};

	//
	// E. Define context value

	const contextValue: StopsContextState = {
		actions: {
			getLegacyStopIds,
			getStopById,
			getStopByIdGeoJsonFC,
		},
		data: {
			fc: dataFeatureCollectionState,
			legacyStopsMap: dataLegacyStopsMapState,
			stops: allStopsData ?? [],
		},
		flags: {
			error: undefined,
			isLoading: allStopsLoading || legacyStopsMapLoading,
		},
	};

	//
	// F. Render components

	return (
		<StopsContext.Provider value={contextValue}>
			{children}
		</StopsContext.Provider>
	);
};

/* * */

export function transformStopDataIntoGeoJsonFeature(stopData: HubStop): GeoJSON.Feature<GeoJSON.Point, HubStop> {
	const feature: GeoJSON.Feature<GeoJSON.Point, HubStop> = {
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
