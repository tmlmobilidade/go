'use client';

import { useLocalStorage } from '@mantine/hooks';
import { type TransitMode, TransitModeValues } from '@tmlmobilidade/types';

interface UseTransitModesReturnType {
	activeTransitModes: TransitMode[]
	availableTransitModes: TransitMode[]
	toggleTransitMode: (mode: TransitMode) => void
}

/**
 * A hook that provides the active and available transit modes.
 * @returns An object with the active and available transit modes, and a function to toggle a transit mode.
 */
export function useTransitModes(): UseTransitModesReturnType {
	//

	//
	// A. Setup variables

	const [activeTransitModes, setActiveTransitModes] = useLocalStorage<TransitMode[]>({
		defaultValue: [...TransitModeValues],
		key: 'active-transit-modes',
	});

	//
	// B. Handle actions

	const toggleTransitMode = (mode: TransitMode) => {
		setActiveTransitModes((prev) => {
			// Remove mode if it exists, otherwise add it
			const finalTransitModes = new Set([...prev]);
			if (finalTransitModes.has(mode)) finalTransitModes.delete(mode);
			else finalTransitModes.add(mode);
			// Return the final transit modes as an array
			return Array.from(finalTransitModes);
		});
	};

	//
	// D. Return data

	return {
		activeTransitModes: activeTransitModes,
		availableTransitModes: [...TransitModeValues],
		toggleTransitMode,
	};

	//
}
