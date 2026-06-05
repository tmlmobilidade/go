'use client';

import { useLocalStorage } from '@mantine/hooks';

/* * */

type BaseMapOverlayType = 'alerts' | 'stops' | 'vehicles';

interface UseBaseMapReturnType {
	activeBaseMapOverlays: BaseMapOverlayType[]
	toggleBaseMapOverlay: (overlay: BaseMapOverlayType) => void
}

/**
 * A hook that provides the active bottom sheet view and a function to set it.
 * @returns An object with the active bottom sheet view and a function to set it.
 */
export function useBaseMap(): UseBaseMapReturnType {
	//

	//
	// A. Setup variables

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

	//
	// C. Return data

	return {
		activeBaseMapOverlays,
		toggleBaseMapOverlay,
	};
}
