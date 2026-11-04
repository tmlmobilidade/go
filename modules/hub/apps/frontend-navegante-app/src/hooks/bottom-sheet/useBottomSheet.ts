'use client';

import { type BottomSheetNavigationEntry, type BottomSheetSnapState } from '@/types/common/bottom-sheet';
import { reduceBottomSheetNavigation } from '@/utils/bottom-sheet/navigation';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

/* * */

interface UseBottomSheetReturnType {
	activeBottomSheet: BottomSheetNavigationEntry | null
	activeBottomSheetSnap: BottomSheetSnapState
	bottomSheetNavigation: BottomSheetNavigationEntry[]
	clear: () => void
	pop: () => void
	push: (value: BottomSheetNavigationEntry) => void
	replaceActive: (value: BottomSheetNavigationEntry) => void
	restore: (entries: BottomSheetNavigationEntry[], snapIndex?: null | number) => void
	restoredSnapIndex: null | number
	setActiveBottomSheetSnap: (value: BottomSheetSnapState, owner: string) => void
	snapActiveBottomSheet: (snapIndex: number) => boolean
	suspend: () => BottomSheetNavigationEntry[]
}

/* * */

let BOTTOM_SHEET_NAVIGATION_STORE: BottomSheetNavigationEntry[] = [];
let BOTTOM_SHEET_SNAP_STORE: BottomSheetSnapState = { snapIndex: null, snapPoint: null };
let BOTTOM_SHEET_SNAP_OWNER: null | string = null;
let RESTORED_SNAP_INDEX: null | number = null;
let ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER: ((snapIndex: number) => void) | null = null;
const bottomSheetNavigationListeners = new Set<() => void>();
const bottomSheetSnapListeners = new Set<() => void>();
const restoredSnapListeners = new Set<() => void>();

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

function getRestoredSnapSnapshot() {
	return RESTORED_SNAP_INDEX;
}

function setBottomSheetNavigationStore(value: BottomSheetNavigationEntry[]) {
	if (BOTTOM_SHEET_NAVIGATION_STORE === value) return;
	BOTTOM_SHEET_NAVIGATION_STORE = value;
	emitBottomSheetNavigationChange();
}

function setRestoredSnapIndex(value: null | number) {
	if (RESTORED_SNAP_INDEX === value) return;
	RESTORED_SNAP_INDEX = value;
	restoredSnapListeners.forEach(listener => listener());
}

function setBottomSheetSnapStore(value: BottomSheetSnapState, owner: string) {
	if (value.snapIndex === null && BOTTOM_SHEET_SNAP_OWNER !== owner) return;
	BOTTOM_SHEET_SNAP_OWNER = value.snapIndex === null ? null : owner;
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

function subscribeToRestoredSnap(listener: () => void) {
	restoredSnapListeners.add(listener);
	return () => {
		restoredSnapListeners.delete(listener);
	};
}

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
	const restoredSnapIndex = useSyncExternalStore(subscribeToRestoredSnap, getRestoredSnapSnapshot, getRestoredSnapSnapshot);

	//
	// B. Transform data

	const activeBottomSheet = useMemo(() => {
		return bottomSheetNavigation[bottomSheetNavigation.length - 1] ?? null;
	}, [bottomSheetNavigation]);

	//
	// C. Handle actions

	const push = useCallback((value: BottomSheetNavigationEntry) => {
		setRestoredSnapIndex(null);
		setBottomSheetNavigationStore(reduceBottomSheetNavigation(BOTTOM_SHEET_NAVIGATION_STORE, { entry: value, type: 'push' }));
	}, []);

	const replaceActive = useCallback((value: BottomSheetNavigationEntry) => {
		setRestoredSnapIndex(null);
		setBottomSheetNavigationStore(reduceBottomSheetNavigation(BOTTOM_SHEET_NAVIGATION_STORE, { entry: value, type: 'replace-active' }));
	}, []);

	const setActiveBottomSheetSnap = useCallback((value: BottomSheetSnapState, owner: string) => {
		setBottomSheetSnapStore(value, owner);
	}, []);

	const snapActiveBottomSheet = useCallback((snapIndex: number) => {
		if (!ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER) return false;
		ACTIVE_BOTTOM_SHEET_SNAP_CONTROLLER(snapIndex);
		return true;
	}, []);

	const pop = useCallback(() => {
		setRestoredSnapIndex(null);
		setBottomSheetNavigationStore(reduceBottomSheetNavigation(BOTTOM_SHEET_NAVIGATION_STORE, { type: 'pop' }));
	}, []);

	const clear = useCallback(() => {
		setRestoredSnapIndex(null);
		setBottomSheetNavigationStore(reduceBottomSheetNavigation(BOTTOM_SHEET_NAVIGATION_STORE, { type: 'clear' }));
	}, []);

	const suspend = useCallback(() => {
		setRestoredSnapIndex(null);
		const previousSheets = BOTTOM_SHEET_NAVIGATION_STORE;
		setBottomSheetNavigationStore(reduceBottomSheetNavigation(previousSheets, { type: 'clear' }));
		return previousSheets;
	}, []);

	const restore = useCallback((entries: BottomSheetNavigationEntry[], snapIndex: null | number = null) => {
		setRestoredSnapIndex(snapIndex);
		setBottomSheetNavigationStore(reduceBottomSheetNavigation(BOTTOM_SHEET_NAVIGATION_STORE, { entries, type: 'restore' }));
	}, []);

	//
	// D. Return data

	return {
		activeBottomSheet,
		activeBottomSheetSnap,
		bottomSheetNavigation,
		clear,
		pop,
		push,
		replaceActive,
		restore,
		restoredSnapIndex,
		setActiveBottomSheetSnap,
		snapActiveBottomSheet,
		suspend,
	};
}
