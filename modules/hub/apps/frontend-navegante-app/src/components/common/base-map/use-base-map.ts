'use client';

import { useUserLocation } from '@/components/common/base-map/use-user-location';
import { useMapContext } from '@/components/map/Map.context';
import { useLocalStorage } from '@mantine/hooks';
import { moveMapView } from '@tmlmobilidade/ui';

/* * */

type BaseMapOverlayType = 'alerts' | 'stops' | 'vehicles';

interface UseBaseMapReturnType {
	activeBaseMapOverlays: BaseMapOverlayType[]
	centerMapOnUserLocation: () => void
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

	const { userLocationCoordinates } = useUserLocation();

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

	const centerMapOnUserLocation = () => {
		if (!userLocationCoordinates) return;
		if (!mapContext.data.map) return;
		moveMapView(mapContext.data.map, userLocationCoordinates, { zoom: 15 });
	};

	//
	// C. Return data

	return {
		activeBaseMapOverlays,
		centerMapOnUserLocation,
		toggleBaseMapOverlay,
	};
}
