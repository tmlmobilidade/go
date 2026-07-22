'use client';

import { getMapInteractionCollapseTarget } from '@/components/common/bottom-sheet/bottom-sheet-behavior';
import { MAP_BOTTOM_SHEET_INITIAL_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/components/common/bottom-sheet/bottom-sheet.constants';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
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
		const collapseTarget = getMapInteractionCollapseTarget({
			compactSnapIndex: MAP_BOTTOM_SHEET_INITIAL_SNAP,
			hasOriginalEvent: Boolean(event.originalEvent),
			snapIndex: activeBottomSheetSnap.snapIndex,
		});
		if (collapseTarget === null) return;
		if (ignoredMapFitSnapPointRef.current === compactSnapPoint) return;

		ignoredMapFitSnapPointRef.current = compactSnapPoint;
		const didSnap = snapActiveBottomSheet(collapseTarget);
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
