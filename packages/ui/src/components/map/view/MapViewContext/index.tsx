'use client';

import { type MapRef } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type GeoJsonProperties, type Geometry } from 'geojson';
import { type MapLibreEvent } from 'maplibre-gl';
import { createContext, type CSSProperties, type PropsWithChildren, type RefObject, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { centerMapView } from '../../utils';
import { loadMapAssets } from '../../utils/load-map-assets';

/* * */

interface MapViewContextState {
	actions: {
		centerMapOnRegisteredSources: () => void
		initMap: (event: MapLibreEvent) => void
		registerOverlaySource: (sourceId: string, data: Feature<Geometry, GeoJsonProperties> | Feature<Geometry, GeoJsonProperties>[] | FeatureCollection<Geometry, GeoJsonProperties>) => void
		toggleAutoZoom: (value?: boolean) => void
		toggleCursor: (cursor: CSSProperties['cursor']) => void
		unregisterOverlaySource: (sourceId: string) => void
	}
	flags: {
		auto_zoom: boolean
		cursor: CSSProperties['cursor']
		loading: boolean
	}
	ref: {
		map: RefObject<MapRef | null>
	}
}

/* * */

const MapViewContext = createContext<MapViewContextState | undefined>(undefined);

export function useMapViewContext() {
	const context = useContext(MapViewContext);
	if (!context) {
		throw new Error('useMapViewContext must be used within a MapViewContextProvider');
	}
	return context;
}

/* * */

export const MapViewContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const mapRef = useRef<MapRef | null>(null);

	const [registeredSources, setRegisteredSources] = useState<Map<string, Feature<Geometry, GeoJsonProperties>[]>>(new Map());

	const [flagCursor, setFlagCursor] = useState<CSSProperties['cursor']>('auto');
	const [flagLoading, setFlagLoading] = useState<boolean>(true);
	const [flagAutoZoom, setFlagAutoZoom] = useState<boolean>(true);

	//
	// B. Handle actions

	useEffect(() => {
		// Skip if map is loading or Auto Zoom is disabled
		if (flagLoading || !flagAutoZoom) return;
		// Center the map on the registered sources
		centerMapOnRegisteredSources();
	}, [flagLoading, flagAutoZoom, registeredSources]);

	const initMap = (event: MapLibreEvent) => {
		loadMapAssets(event.target);
		setFlagLoading(false);
	};

	const registerOverlaySource = (sourceId: string, data: Feature<Geometry, GeoJsonProperties> | Feature<Geometry, GeoJsonProperties>[] | FeatureCollection<Geometry, GeoJsonProperties>) => {
		// If the data is a FeatureCollection then register the features
		if ('features' in data) setRegisteredSources(prev => new Map(prev).set(sourceId, data.features));
		// If the data is an array of features then register them
		else if (Array.isArray(data)) setRegisteredSources(prev => new Map(prev).set(sourceId, data));
		// If the data is a single feature, wrap it in an array
		else if ('geometry' in data) setRegisteredSources(prev => new Map(prev).set(sourceId, [data]));
	};

	const unregisterOverlaySource = (sourceId: string) => {
		setRegisteredSources((prev) => {
			const next = new Map(prev);
			next.delete(sourceId);
			return next;
		});
	};

	const centerMapOnRegisteredSources = () => {
		// Skip if the map is not available
		if (!mapRef.current) return;
		// Get the features to center the map on
		const features = Array.from(registeredSources.values()).flat();
		// Center the map
		centerMapView(mapRef.current, features);
		// Re-enable auto zoom, if it was disabled
		toggleAutoZoom(true);
	};

	const toggleAutoZoom = (value?: boolean) => {
		if (value !== undefined) setFlagAutoZoom(value);
		else setFlagAutoZoom(prev => !prev);
	};

	const toggleCursor = (cursor?: CSSProperties['cursor']) => {
		if (!cursor) setFlagCursor('auto');
		setFlagCursor(cursor);
	};

	//
	// C. Define context value

	const contextValue: MapViewContextState = useMemo(() => ({
		actions: {
			centerMapOnRegisteredSources,
			initMap,
			registerOverlaySource,
			toggleAutoZoom,
			toggleCursor,
			unregisterOverlaySource,
		},
		flags: {
			auto_zoom: flagAutoZoom,
			cursor: flagCursor,
			loading: flagLoading,
		},
		ref: {
			map: mapRef,
		},
	}), [
		flagAutoZoom,
		flagCursor,
		flagLoading,
	]);

	//
	// D. Render components

	return (
		<MapViewContext.Provider value={contextValue}>
			{children}
		</MapViewContext.Provider>
	);

	//
};
