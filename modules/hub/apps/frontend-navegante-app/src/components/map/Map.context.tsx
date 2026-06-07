'use client';

import { useUserLocation } from '@/components/map/use-user-location';
import { useLocalStorage } from '@mantine/hooks';
import { moveMapView } from '@tmlmobilidade/ui';
import { type MapRef } from '@vis.gl/react-maplibre';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

/* * */

type BaseMapOverlayType = 'alerts' | 'stops' | 'vehicles';

interface MapContextState {
	actions: {
		moveMap: (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => void
		setMap: (map: MapRef) => void
		toggleBaseMapOverlay: (overlay: BaseMapOverlayType) => void
	}
	data: {
		activeBaseMapOverlays: BaseMapOverlayType[]
		map: MapRef | undefined
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

	const [dataMapState, setDataMapState] = useState<MapContextState['data']['map']>(undefined);

	const { userLocation, userLocationTrackingMode } = useUserLocation();

	const [activeBaseMapOverlays, setActiveBaseMapOverlays] = useLocalStorage<BaseMapOverlayType[]>({
		defaultValue: ['alerts', 'stops', 'vehicles'],
		key: 'active-viewport-map-sources',
	});

	//
	// B. Handle actions

	const setMap = (map: MapRef) => {
		setDataMapState(map);
	};

	const moveMap = (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => {
		if (params.isUserInitiated) dataMapState?.stop();
		moveMapView(dataMapState, [params.longitude, params.latitude], { zoom: 15 });
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
		moveMapView(dataMapState, coordinates, { bearing, zoom: 15 });
	}, [userLocationTrackingMode, userLocation, dataMapState]);

	//
	// C. Define context value

	const contextValue: MapContextState = {
		actions: {
			moveMap,
			setMap,
			toggleBaseMapOverlay,
		},
		data: {
			activeBaseMapOverlays,
			map: dataMapState,
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
