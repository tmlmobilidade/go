'use client';

import { useLocalStorage } from '@mantine/hooks';
import { type TransitMode, TransitModeValues } from '@tmlmobilidade/types';
import { useMemo } from 'react';

/* * */

const AGENCY_IDS_MAP: Record<TransitMode, string[]> = {
	bus: ['1', '8', '21', '41', '42', '43', '44'],
	ferry: ['4'],
	subway: ['2', '16'],
	train: ['3', '15'],
};

/* * */

interface UseTransitModesReturnType {
	activeAgencyIds: string[]
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
	// B. Transform data

	const activeAgencyIds = useMemo(() => {
		const result = Array.from(new Set(activeTransitModes.flatMap(mode => AGENCY_IDS_MAP[mode])));
		if (!result.length) return Object.values(AGENCY_IDS_MAP).flat().filter(Boolean);
		return result;
	}, [activeTransitModes]);

	//
	// B. Handle actions

	const toggleTransitMode = (mode: TransitMode) => {
		setActiveTransitModes((prev) => {
			// Remove mode if it exists, otherwise add it
			const finalTransitModes = new Set([...prev]);
			if (finalTransitModes.has(mode)) finalTransitModes.delete(mode);
			else finalTransitModes.add(mode);
			// If all are to be selected, select the one that is not the current one
			if (finalTransitModes.size === TransitModeValues.length) return [mode];
			// Return the final transit modes as an array
			return Array.from(finalTransitModes);
		});
	};

	//
	// D. Return data

	return {
		activeAgencyIds: activeAgencyIds,
		activeTransitModes: activeTransitModes,
		availableTransitModes: [...TransitModeValues],
		toggleTransitMode,
	};

	//
}
