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

	const { userLocationCoordinates, userLocationTrackingMode } = useUserLocation();

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
		if (!userLocationCoordinates) return;
		if (!mapContext.data.map) return;
		moveMapView(mapContext.data.map, userLocationCoordinates, { zoom: 15 });
	};

	useEffect(() => {
		if (userLocationTrackingMode === 'disabled') return;
		if (!userLocationCoordinates) return;
		moveMapToUserLocation();
	}, [userLocationTrackingMode, userLocationCoordinates]);

	//
	// C. Return data

	return {
		activeBaseMapOverlays,
		moveMapToUserLocation,
		toggleBaseMapOverlay,
	};
}
