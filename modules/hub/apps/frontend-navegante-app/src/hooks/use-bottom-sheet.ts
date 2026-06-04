'use client';

import { useLocalStorage } from '@mantine/hooks';

/* * */

type BottomSheetType = 'help' | 'line-detail' | 'search' | 'stop-detail' | null;

interface UseBottomSheetReturnType {
	activeBottomSheet: BottomSheetType
	setActiveBottomSheet: (view: BottomSheetType) => void
}

/**
 * A hook that provides the active bottom sheet view and a function to set it.
 * @returns An object with the active bottom sheet view and a function to set it.
 */
export function useBottomSheet(): UseBottomSheetReturnType {
	//

	//
	// A. Setup variables

	const [activeBottomSheet, setActiveBottomSheet] = useLocalStorage<BottomSheetType>({
		defaultValue: null,
		key: 'active-bottom-sheet',
	});

	//
	// B. Return data

	return {
		activeBottomSheet,
		setActiveBottomSheet,
	};
}
