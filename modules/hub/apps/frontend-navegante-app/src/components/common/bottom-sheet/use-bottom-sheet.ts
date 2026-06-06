'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useMemo } from 'react';

/* * */

type BottomSheetType = 'alerts-detail' | 'alerts-list' | 'help' | 'lines-detail' | 'search' | 'stops-detail' | 'vehicles-detail' | null;

interface BottomSheetNavigationType {
	entityId?: null | string
	view: BottomSheetType
}

interface SetActiveBottomSheetOptions {
	replace?: boolean
}

interface UseBottomSheetReturnType {
	activeBottomSheet: BottomSheetNavigationType | null
	closeActiveBottomSheet: () => void
	isBottomSheetInStack: (view: BottomSheetType) => boolean
	setActiveBottomSheet: (value: BottomSheetNavigationType, options?: SetActiveBottomSheetOptions) => void
}

/**
 * A hook that provides the active bottom sheet, and a function to set it.
 * @returns An object with the active bottom sheet view and entity id, and a function to set it, and a function to close the active bottom sheet.
 */
export function useBottomSheet(): UseBottomSheetReturnType {
	//

	//
	// A. Setup variables

	const [bottomSheetNavigation, setBottomSheetNavigation] = useLocalStorage<BottomSheetNavigationType[]>({
		defaultValue: [],
		key: 'bottom-sheet-navigation',
	});

	//
	// B. Transform data

	const activeBottomSheet = useMemo(() => {
		return bottomSheetNavigation[bottomSheetNavigation.length - 1] ?? null;
	}, [bottomSheetNavigation]);

	//
	// C. Handle actions

	const setActiveBottomSheet = (value: BottomSheetNavigationType, options?: SetActiveBottomSheetOptions) => {
		// If replace is true, override the full navigation stack with the new value
		if (options?.replace) setBottomSheetNavigation([{ entityId: value.entityId ?? null, view: value.view }]);
		// Otherwise, append the new value to the navigation stack
		else setBottomSheetNavigation(prev => [...prev, { entityId: value.entityId ?? null, view: value.view }]);
	};

	const closeActiveBottomSheet = () => {
		setBottomSheetNavigation(prev => prev?.slice(0, -1));
	};

	const isBottomSheetInStack = (view: BottomSheetType) => {
		return bottomSheetNavigation.some(entry => entry.view === view);
	};

	//
	// D. Return data

	return {
		activeBottomSheet,
		closeActiveBottomSheet,
		isBottomSheetInStack,
		setActiveBottomSheet,
	};
}
