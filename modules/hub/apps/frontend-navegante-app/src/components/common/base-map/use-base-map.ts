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
	moveMapToUserLocation: () => void
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

	const moveMapToUserLocation = () => {
		if (!userLocation?.latitude || !userLocation?.longitude) return;
		if (!mapContext.data.map) return;
		const coordinates = [userLocation.longitude, userLocation.latitude];
		const bearing = userLocationTrackingMode === 'follow-bearing' ? userLocation.bearing : undefined;
		moveMapView(mapContext.data.map, coordinates, { bearing, zoom: 15 });
	};

	useEffect(() => {
		if (userLocationTrackingMode === 'disabled') return;
		if (!userLocation?.latitude || !userLocation?.longitude) return;
		moveMapToUserLocation();
	}, [userLocationTrackingMode, userLocation]);

	//
	// C. Return data

	return {
		activeBaseMapOverlays,
		moveMapToUserLocation,
		toggleBaseMapOverlay,
	};
}
