'use client';

import { type BottomSheetNavigationEntry, type BottomSheetSnapState, type BottomSheetView, type SetActiveBottomSheetOptions } from '@/types/bottom-sheet';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

/* * */

interface UseBottomSheetReturnType {
	activeBottomSheet: BottomSheetNavigationEntry | null
	activeBottomSheetSnap: BottomSheetSnapState
	clearActiveBottomSheets: () => void
	closeActiveBottomSheet: () => void
	isBottomSheetInStack: (view: BottomSheetView) => boolean
	setActiveBottomSheet: (value: BottomSheetNavigationEntry, options?: SetActiveBottomSheetOptions) => void
	setActiveBottomSheetSnap: (value: BottomSheetSnapState) => void
	snapActiveBottomSheet: (snapIndex: number) => boolean
}

/* * */

let BOTTOM_SHEET_NAVIGATION_STORE: BottomSheetNavigationEntry[] = [];
let BOTTOM_SHEET_SNAP_STORE: BottomSheetSnapState = { snapIndex: null, snapPoint: null };
let ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER: ((snapIndex: number) => void) | null = null;
const bottomSheetNavigationListeners = new Set<() => void>();
const bottomSheetSnapListeners = new Set<() => void>();

export function registerActiveBottomSheetSnapController(controller: (snapIndex: number) => void) {
	ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER = controller;

	return () => {
		if (ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER === controller) ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER = null;
	};
}

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

function setBottomSheetNavigationStore(value: BottomSheetNavigationEntry[]) {
	BOTTOM_SHEET_NAVIGATION_STORE = value;
	emitBottomSheetNavigationChange();
}

function setBottomSheetSnapStore(value: BottomSheetSnapState) {
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

	const setActiveBottomSheet = useCallback((value: BottomSheetNavigationEntry, options?: SetActiveBottomSheetOptions) => {
		// If replace is true, override the full navigation stack with the new value
		if (options?.replace) setBottomSheetNavigationStore([{ entityId: value.entityId ?? null, view: value.view }]);
		// Otherwise, append the new value to the navigation stack
		else setBottomSheetNavigationStore([...BOTTOM_SHEET_NAVIGATION_STORE, { entityId: value.entityId ?? null, view: value.view }]);
	}, []);

	const setActiveBottomSheetSnap = useCallback((value: BottomSheetSnapState) => {
		setBottomSheetSnapStore(value);
	}, []);

	const snapActiveBottomSheet = useCallback((snapIndex: number) => {
		if (!ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER) return false;
		ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER(snapIndex);
		return true;
	}, []);

	const closeActiveBottomSheet = useCallback(() => {
		setBottomSheetNavigationStore(BOTTOM_SHEET_NAVIGATION_STORE.slice(0, -1));
	}, []);

	const clearActiveBottomSheets = useCallback(() => {
		setBottomSheetNavigationStore([]);
	}, []);

	const isBottomSheetInStack = useCallback((view: BottomSheetView) => {
		return bottomSheetNavigation.some(entry => entry.view === view);
	}, [bottomSheetNavigation]);

	//
	// D. Return data

	return {
		activeBottomSheet,
		activeBottomSheetSnap,
		clearActiveBottomSheets,
		closeActiveBottomSheet,
		isBottomSheetInStack,
		setActiveBottomSheet,
		setActiveBottomSheetSnap,
		snapActiveBottomSheet,
	};
}
