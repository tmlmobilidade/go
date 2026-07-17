'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
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

export const MAP_BOTTOM_SHEET_INITIAL_SNAP = 1;
export const MAP_BOTTOM_SHEET_SNAP_POINTS = [0, 0.28, 0.64, 0.95];

/* * */

export function useMapBottomSheet() {
	//

	//
	// A. Setup variables

	const { activeBottomSheetSnap, snapActiveBottomSheet } = useBottomSheet();
	const ignoredMapFitSnapPointRef = useRef<null | number>(null);

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

	const shouldFitMap = ignoredMapFitSnapPointRef.current !== activeBottomSheetSnap.snapPoint;

	useEffect(() => {
		if (ignoredMapFitSnapPointRef.current === null) return;
		if (activeBottomSheetSnap.snapPoint === ignoredMapFitSnapPointRef.current) return;
		ignoredMapFitSnapPointRef.current = null;
	}, [activeBottomSheetSnap.snapPoint]);

	//
	// C. Handle actions

	const collapseForMapInteraction = useCallback((event: ViewStateChangeEvent) => {
		if (!event.originalEvent) return;
		if (activeBottomSheetSnap.snapIndex === null || activeBottomSheetSnap.snapIndex <= MAP_BOTTOM_SHEET_INITIAL_SNAP) return;
		if (ignoredMapFitSnapPointRef.current === compactSnapPoint) return;

		ignoredMapFitSnapPointRef.current = compactSnapPoint;
		const didSnap = snapActiveBottomSheet(MAP_BOTTOM_SHEET_INITIAL_SNAP);
		if (!didSnap) ignoredMapFitSnapPointRef.current = null;
	}, [activeBottomSheetSnap.snapIndex, compactSnapPoint, snapActiveBottomSheet]);

	//
	// D. Return data

	return {
		collapseForMapInteraction,
		mapPadding,
		shouldFitMap,
	};

	//
}
