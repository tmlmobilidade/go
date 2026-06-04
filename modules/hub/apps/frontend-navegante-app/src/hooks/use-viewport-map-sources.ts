'use client';

import { useLocalStorage } from '@mantine/hooks';

/* * */

type SourceType = 'alerts' | 'stops' | 'vehicles';

interface UseViewportMapSourcesReturnType {
	activeViewportMapSources: SourceType[]
	toggleViewportMapSource: (source: SourceType) => void
}

/**
 * A hook that provides the active bottom sheet view and a function to set it.
 * @returns An object with the active bottom sheet view and a function to set it.
 */
export function useViewportMapSources(): UseViewportMapSourcesReturnType {
	//

	//
	// A. Setup variables

	const [activeViewportMapSources, setActiveViewportMapSources] = useLocalStorage<SourceType[]>({
		defaultValue: ['alerts', 'stops', 'vehicles'],
		key: 'active-viewport-map-sources',
	});

	//
	// B. Handle actions

	const toggleViewportMapSource = (source: SourceType) => {
		setActiveViewportMapSources((prev) => {
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
		activeViewportMapSources,
		toggleViewportMapSource,
	};
}
