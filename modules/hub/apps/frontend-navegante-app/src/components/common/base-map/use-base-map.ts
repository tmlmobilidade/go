'use client';

import { useMapContext } from '@/components/map/Map.context';
import { useUserLocation } from '@/components/map/use-user-location';
import { useLocalStorage } from '@mantine/hooks';
import { moveMapView } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

/* * */

type BaseMapOverlayType = 'alerts' | 'stops' | 'vehicles';

interface UseBaseMapReturnType {
	activeBaseMapOverlays: BaseMapOverlayType[]
	moveMap: (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => void
	toggleBaseMapOverlay: (overlay: BaseMapOverlayType) => void
}

/**
 * A hook that manages base map overlays and user location actions.
 * @returns An object with overlay state, user location state, and map actions.
 */
export function useBaseMap(): UseBaseMapReturnType {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();

	const { userLocation, userLocationTrackingMode } = useUserLocation();

	const [activeBaseMapOverlays, setActiveBaseMapOverlays] = useLocalStorage<BaseMapOverlayType[]>({
		defaultValue: ['alerts', 'stops', 'vehicles'],
		key: 'active-viewport-map-sources',
	});

	//
	// B. Handle actions

	const moveMap = (params: { isUserInitiated: boolean, latitude: number, longitude: number }) => {
		if (params.isUserInitiated) mapContext.data.map.stop();
		moveMapView(mapContext.data.map, [params.longitude, params.latitude]);
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
		moveMapView(mapContext.data.map, coordinates, { bearing });
	}, [userLocationTrackingMode, userLocation]);

	//
	// C. Return data

	return {
		activeBaseMapOverlays,
		moveMap,
		toggleBaseMapOverlay,
	};
}
