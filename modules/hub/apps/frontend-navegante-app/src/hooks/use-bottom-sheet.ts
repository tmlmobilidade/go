'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useMemo } from 'react';

/* * */

type BottomSheetType = 'alerts' | 'help' | 'line-detail' | 'search' | 'stop-detail' | null;

interface BottomSheetNavigationType {
	entityId?: null | string
	view: BottomSheetType
}

interface UseBottomSheetReturnType {
	activeBottomSheet: BottomSheetNavigationType | null
	closeActiveBottomSheet: () => void
	setActiveBottomSheet: (value: BottomSheetNavigationType) => void
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

	const setActiveBottomSheet = (value: BottomSheetNavigationType) => {
		setBottomSheetNavigation(prev => [...prev, { entityId: value.entityId ?? null, view: value.view }]);
	};

	const closeActiveBottomSheet = () => {
		setBottomSheetNavigation(prev => prev?.slice(0, -1));
	};

	//
	// D. Return data

	return {
		activeBottomSheet,
		closeActiveBottomSheet,
		setActiveBottomSheet,
	};
}
