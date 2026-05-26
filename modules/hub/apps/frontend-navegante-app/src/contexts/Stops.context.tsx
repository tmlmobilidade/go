'use client';

import { agencyMatchesSelection, agencyMatchesTransports, type TransportOption, transportsSelectionIsAll } from '@/contexts/GlobalSettings.context';
import { type Line, type NetworkRoute, type NetworkStop } from '@/types/api/network';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsContextState {
	actions: {
		getStopById: (stopId: string) => NetworkStop | undefined
		getStopByIdGeoJsonFC: (stopId: string) => GeoJSON.FeatureCollection | undefined
	}
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
		stops: NetworkStop[]
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

export function StopsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allStopsData, isLoading: allStopsLoading } = useSWR<NetworkStop[]>(API_ROUTES.hub.NETWORK_STOPS); // 15 minutes

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
			fc: dataFeatureCollectionState,
			stops: allStopsData ?? [],
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

function addRef(map: Map<string, string>, ref: string | undefined, agencyId: string | undefined) {
	if (!ref || !agencyId) return;
	map.set(ref, agencyId);
}

export function buildRefToAgencyIdMap(lines: Line[], routes: NetworkRoute[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const line of lines) {
		addRef(map, line.id, line.agency_id);
		addRef(map, line.short_name, line.agency_id);
	}
	for (const route of routes) {
		addRef(map, route.id, route.agency_id);
		addRef(map, route.short_name, route.agency_id);
	}
	return map;
}

export function getAgencyIdsForStop(stop: NetworkStop, refToAgency: Map<string, string>): string[] {
	const agencyIds = new Set<string>();
	for (const ref of [...(stop.line_ids ?? []), ...(stop.route_ids ?? [])]) {
		const agencyId = refToAgency.get(ref);
		if (agencyId) agencyIds.add(agencyId);
	}
	return [...agencyIds];
}

export function stopMatchesAgencyTransportFilters(stop: NetworkStop, refToAgency: Map<string, string>, filterByAgency: string[], filterByTransports: TransportOption[]) {
	const isAllAgencies = filterByAgency.length === 0;
	const isAllTransports = transportsSelectionIsAll(filterByTransports);
	if (isAllAgencies && isAllTransports) return true;

	const agencyIds = getAgencyIdsForStop(stop, refToAgency);
	if (agencyIds.length === 0) return false;

	return agencyIds.some((agencyId) => {
		return (isAllAgencies || agencyMatchesSelection(agencyId, filterByAgency)) && (isAllTransports || agencyMatchesTransports(agencyId, filterByTransports));
	});
}
