'use client';

import { useLocalStorage } from '@mantine/hooks';

/* * */

type ViewportMapOverlayType = 'alerts' | 'stops' | 'vehicles';

interface UseViewportMapOverlaysReturnType {
	activeViewportMapOverlays: ViewportMapOverlayType[]
	toggleViewportMapOverlay: (overlay: ViewportMapOverlayType) => void
}

/**
 * A hook that provides the active bottom sheet view and a function to set it.
 * @returns An object with the active bottom sheet view and a function to set it.
 */
export function useViewportMapOverlays(): UseViewportMapOverlaysReturnType {
	//

	//
	// A. Setup variables

	const [activeViewportMapOverlays, setActiveViewportMapOverlays] = useLocalStorage<ViewportMapOverlayType[]>({
		defaultValue: ['alerts', 'stops', 'vehicles'],
		key: 'active-viewport-map-sources',
	});

	//
	// B. Handle actions

	const toggleViewportMapOverlay = (source: ViewportMapOverlayType) => {
		setActiveViewportMapOverlays((prev) => {
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
		activeViewportMapOverlays,
		toggleViewportMapOverlay,
	};
}
