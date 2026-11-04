'use client';

import { MAP_BOTTOM_SHEET_INITIAL_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/constants/bottom-sheet';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { getMapInteractionCollapseTarget } from '@/utils/bottom-sheet/behavior';
import { type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { useCallback, useEffect, useMemo, useRef } from 'react';

/* * */

interface MapPadding {
	bottom: number
	left: number
	right: number
	top: number
}

/* * */

export function useMapBottomSheet() {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, activeBottomSheetSnap, snapActiveBottomSheet } = useBottomSheet();
	const ignoredMapFitRef = useRef<null | { navigationEntry: typeof activeBottomSheet, snapPoint: number }>(null);

	const compactSnapPoint = MAP_BOTTOM_SHEET_SNAP_POINTS[MAP_BOTTOM_SHEET_INITIAL_SNAP];

	//
	// B. Transform data

	const mapPadding = useMemo<MapPadding>(() => {
		const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight;
		const sheetHeight = Math.round(viewportHeight * (activeBottomSheetSnap.snapPoint ?? compactSnapPoint));

		return {
			bottom: Math.max(260, sheetHeight + 32),
			left: 60,
			right: 60,
			top: 120,
		};
	}, [activeBottomSheetSnap.snapPoint, compactSnapPoint]);

	const shouldFitMap = ignoredMapFitRef.current?.navigationEntry !== activeBottomSheet || ignoredMapFitRef.current?.snapPoint !== activeBottomSheetSnap.snapPoint;

	useEffect(() => {
		if (ignoredMapFitRef.current === null) return;
		if (activeBottomSheet === ignoredMapFitRef.current.navigationEntry && activeBottomSheetSnap.snapPoint === ignoredMapFitRef.current.snapPoint) return;
		ignoredMapFitRef.current = null;
	}, [activeBottomSheet, activeBottomSheetSnap.snapPoint]);

	//
	// C. Handle actions

	const collapseForMapInteraction = useCallback((event: ViewStateChangeEvent) => {
		const collapseTarget = getMapInteractionCollapseTarget({
			compactSnapIndex: MAP_BOTTOM_SHEET_INITIAL_SNAP,
			hasOriginalEvent: Boolean(event.originalEvent),
			snapIndex: activeBottomSheetSnap.snapIndex,
		});
		if (collapseTarget === null) return;
		if (ignoredMapFitRef.current?.navigationEntry === activeBottomSheet && ignoredMapFitRef.current.snapPoint === compactSnapPoint) return;

		ignoredMapFitRef.current = { navigationEntry: activeBottomSheet, snapPoint: compactSnapPoint };
		const didSnap = snapActiveBottomSheet(collapseTarget);
		if (!didSnap) ignoredMapFitRef.current = null;
	}, [activeBottomSheet, activeBottomSheetSnap.snapIndex, compactSnapPoint, snapActiveBottomSheet]);

	//
	// D. Return data

	return {
		collapseForMapInteraction,
		mapPadding,
		shouldFitMap,
	};

	//
}
