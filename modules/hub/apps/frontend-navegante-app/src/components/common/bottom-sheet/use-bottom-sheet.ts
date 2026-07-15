'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/* * */

type BottomSheetType = 'alerts-detail' | 'alerts-list' | 'help' | 'lines-detail' | 'routes' | 'search' | 'stops-detail' | 'vehicles-detail' | null;

interface BottomSheetNavigationType {
	entityId?: null | string
	view: BottomSheetType
}

interface BottomSheetSnapType {
	snapIndex: null | number
	snapPoint: null | number
}

interface SetActiveBottomSheetOptions {
	replace?: boolean
}

interface UseBottomSheetReturnType {
	activeBottomSheet: BottomSheetNavigationType | null
	activeBottomSheetSnap: BottomSheetSnapType
	closeActiveBottomSheet: () => void
	isBottomSheetInStack: (view: BottomSheetType) => boolean
	setActiveBottomSheet: (value: BottomSheetNavigationType, options?: SetActiveBottomSheetOptions) => void
	setActiveBottomSheetSnap: (value: BottomSheetSnapType) => void
}

/* * */

let BOTTOM_SHEET_NAVIGATION_STORE: BottomSheetNavigationType[] = [];
let BOTTOM_SHEET_SNAP_STORE: BottomSheetSnapType = { snapIndex: null, snapPoint: null };
const bottomSheetNavigationListeners = new Set<() => void>();
const bottomSheetSnapListeners = new Set<() => void>();

function emitBottomSheetNavigationChange() {
	bottomSheetNavigationListeners.forEach(listener => listener());
}

function emitBottomSheetSnapChange() {
	bottomSheetSnapListeners.forEach(listener => listener());
}

function getBottomSheetNavigationSnapshot() {
	return BOTTOM_SHEET_NAVIGATION_STORE;
}

function getBottomSheetSnapSnapshot() {
	return BOTTOM_SHEET_SNAP_STORE;
}

function setBottomSheetNavigationStore(value: BottomSheetNavigationType[]) {
	BOTTOM_SHEET_NAVIGATION_STORE = value;
	emitBottomSheetNavigationChange();
}

function setBottomSheetSnapStore(value: BottomSheetSnapType) {
	if (BOTTOM_SHEET_SNAP_STORE.snapIndex === value.snapIndex && BOTTOM_SHEET_SNAP_STORE.snapPoint === value.snapPoint) return;
	BOTTOM_SHEET_SNAP_STORE = value;
	emitBottomSheetSnapChange();
}

function subscribeToBottomSheetNavigation(listener: () => void) {
	bottomSheetNavigationListeners.add(listener);
	return () => {
		bottomSheetNavigationListeners.delete(listener);
	};
}

function subscribeToBottomSheetSnap(listener: () => void) {
	bottomSheetSnapListeners.add(listener);
	return () => {
		bottomSheetSnapListeners.delete(listener);
	};
}

/**
 * A hook that provides the active bottom sheet, and a function to set it.
 * @returns An object with the active bottom sheet view and entity id, and a function to set it, and a function to close the active bottom sheet.
 */
export function useBottomSheet(): UseBottomSheetReturnType {
	//

	//
	// A. Setup variables

	const bottomSheetNavigation = useSyncExternalStore(
		subscribeToBottomSheetNavigation,
		getBottomSheetNavigationSnapshot,
		getBottomSheetNavigationSnapshot,
	);

	const activeBottomSheetSnap = useSyncExternalStore(
		subscribeToBottomSheetSnap,
		getBottomSheetSnapSnapshot,
		getBottomSheetSnapSnapshot,
	);

	//
	// B. Transform data

	const activeBottomSheet = useMemo(() => {
		return bottomSheetNavigation[bottomSheetNavigation.length - 1] ?? null;
	}, [bottomSheetNavigation]);

	//
	// C. Handle actions

	const setActiveBottomSheet = useCallback((value: BottomSheetNavigationType, options?: SetActiveBottomSheetOptions) => {
		// If replace is true, override the full navigation stack with the new value
		if (options?.replace) setBottomSheetNavigationStore([{ entityId: value.entityId ?? null, view: value.view }]);
		// Otherwise, append the new value to the navigation stack
		else setBottomSheetNavigationStore([...BOTTOM_SHEET_NAVIGATION_STORE, { entityId: value.entityId ?? null, view: value.view }]);
	}, []);

	const setActiveBottomSheetSnap = useCallback((value: BottomSheetSnapType) => {
		setBottomSheetSnapStore(value);
	}, []);

	const closeActiveBottomSheet = useCallback(() => {
		setBottomSheetNavigationStore(BOTTOM_SHEET_NAVIGATION_STORE.slice(0, -1));
	}, []);

	const isBottomSheetInStack = useCallback((view: BottomSheetType) => {
		return bottomSheetNavigation.some(entry => entry.view === view);
	}, [bottomSheetNavigation]);

	//
	// D. Return data

	return {
		activeBottomSheet,
		activeBottomSheetSnap,
		closeActiveBottomSheet,
		isBottomSheetInStack,
		setActiveBottomSheet,
		setActiveBottomSheetSnap,
	};
}
