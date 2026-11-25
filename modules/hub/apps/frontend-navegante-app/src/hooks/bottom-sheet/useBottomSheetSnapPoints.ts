'use client';

import { getInsetAdjustedSnapPoints } from '@/utils/bottom-sheet/behavior';
import { type RefCallback, type RefObject, useEffect, useMemo, useState } from 'react';

/* * */

interface UseBottomSheetSnapPointsParams {
	containerRef: RefObject<HTMLDivElement | null>
	opened: boolean
	snapPoints: number[]
}

interface UseBottomSheetSnapPointsReturnType {
	contentRef: RefCallback<HTMLDivElement>
	snapPoints: number[]
}

/* * */

export function useBottomSheetSnapPoints({ containerRef, opened, snapPoints }: UseBottomSheetSnapPointsParams): UseBottomSheetSnapPointsReturnType {
	//

	//
	// A. Setup variables

	const [content, setContent] = useState<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState({ bottomInset: 0, sheetHeight: 0 });

	//
	// B. Measure the available sheet space

	useEffect(() => {
		const container = containerRef.current;
		if (!opened || !container || !content) return;

		const measure = () => {
			const bottomInset = Number.parseFloat(getComputedStyle(content).paddingBottom) || 0;
			const sheetHeight = container.offsetHeight;
			setDimensions(previous => previous.bottomInset === bottomInset && previous.sheetHeight === sheetHeight ? previous : { bottomInset, sheetHeight });
		};

		measure();
		// The content box also changes when native safe-area padding changes.
		const observer = new ResizeObserver(measure);
		observer.observe(container);
		observer.observe(content);
		return () => observer.disconnect();
	}, [containerRef, content, opened]);

	//
	// C. Return adjusted snap points

	return useMemo(() => ({
		contentRef: setContent,
		snapPoints: getInsetAdjustedSnapPoints(snapPoints, dimensions.bottomInset, dimensions.sheetHeight),
	}), [dimensions.bottomInset, dimensions.sheetHeight, snapPoints]);

	//
}
