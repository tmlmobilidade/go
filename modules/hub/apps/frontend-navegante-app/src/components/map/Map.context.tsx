'use client';

import { type MapStyle } from '@/components/map/MapView';
import { useUserLocation } from '@/components/map/use-user-location';
import { useLocalStorage } from '@mantine/hooks';
import { moveMapView } from '@tmlmobilidade/ui';
import * as turf from '@turf/turf';
import { type MapRef } from '@vis.gl/react-maplibre';
import maplibregl from 'maplibre-gl';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

/* * */

type BaseMapOverlayType = 'alerts' | 'stops' | 'vehicles';

interface MapContextState {
	actions: {
		centerMap: (source?: string) => void
		moveMap: (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => void
		setMap: (map: MapRef) => void
		setStyle: (value: MapStyle) => void
		toggleBaseMapOverlay: (overlay: BaseMapOverlayType) => void
	}
	data: {
		activeBaseMapOverlays: BaseMapOverlayType[]
		map: MapRef | undefined
		style: string
	}
	flags: {
		isLoading: boolean
	}
}

/* * */

const MapContext = createContext<MapContextState | undefined>(undefined);

export function useMapContext() {
	const context = useContext(MapContext);
	if (!context) {
		throw new Error('useMapContext must be used within a MapContextProvider');
	}
	return context;
}

/* * */

export function MapContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const [dataStyleState, setDataStyleState] = useState<MapContextState['data']['style']>('map');
	const [dataMapState, setDataMapState] = useState<MapContextState['data']['map']>(undefined);

	const { userLocation, userLocationTrackingMode } = useUserLocation();

	const [activeBaseMapOverlays, setActiveBaseMapOverlays] = useLocalStorage<BaseMapOverlayType[]>({
		defaultValue: ['alerts', 'stops', 'vehicles'],
		key: 'active-viewport-map-sources',
	});

	//
	// B. Handle actions

	const setStyle = (value: MapStyle) => {
		setDataStyleState(value);
	};

	const setMap = (map: MapRef) => {
		setDataMapState(map);
	};

	const centerMap = (sourceId: string) => {
		if (!dataMapState || !sourceId) return;

		const sourceData = dataMapState.getSource(sourceId);
		if (!sourceData) return;

		const combine = turf.combine(sourceData.serialize().data);
		const coordinates = combine.features[0].geometry.coordinates;

		// Calculate bounds
		const bounds = coordinates.reduce((bounds, coord) => {
			return bounds.extend(coord as [number, number]);
		}, new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

		dataMapState.fitBounds(
			bounds,
			{ padding: 25 },
		);

		// return;
	};

	const moveMap = (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => {
		if (params.isUserInitiated) dataMapState?.stop();
		moveMapView(dataMapState, [params.longitude, params.latitude]);
	};

	const toggleBaseMapOverlay = (source: BaseMapOverlayType) => {
		setActiveBaseMapOverlays((prev) => {
			// Create a new set with the previous sources
			const result = new Set([...prev]);
			// Toggle the source
			if (result.has(source)) result.delete(source);
			else result.add(source);
			// Return the new sources as an array
			return Array.from(result);
		});
	};

	useEffect(() => {
		// Skip if the user location tracking mode is idle
		if (userLocationTrackingMode === 'idle') return;
		// Skip if the user location is not available
		if (!userLocation?.latitude || !userLocation?.longitude) return;
		// Get the coordinates and bearing
		const coordinates = [userLocation.longitude, userLocation.latitude];
		const bearing = userLocationTrackingMode === 'follow-bearing' ? userLocation.bearing : undefined;
		// Move the map view
		moveMapView(dataMapState, coordinates, { bearing });
	}, [userLocationTrackingMode, userLocation, dataMapState]);

	//
	// C. Define context value

	const contextValue: MapContextState = {
		actions: {
			centerMap,
			moveMap,
			setMap,
			setStyle,
			toggleBaseMapOverlay,
		},
		data: {
			activeBaseMapOverlays,
			map: dataMapState,
			style: dataStyleState,
		},
		flags: {
			isLoading: false,
		},
	};

	//
	// D. Render components

	return (
		<MapContext.Provider value={contextValue}>
			{children}
		</MapContext.Provider>
	);
}
