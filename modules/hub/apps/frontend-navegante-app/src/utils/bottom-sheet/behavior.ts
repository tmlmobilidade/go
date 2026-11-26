import { type BottomSheetSnapState } from '@/types/common/bottom-sheet';

/* * */

interface GetMapInteractionCollapseTargetParams {
	compactSnapIndex: number
	hasOriginalEvent: boolean
	snapIndex: null | number
}

interface ShouldShowBottomSheetOverlayParams {
	snapIndex: null | number
	snapPoints: number[]
	withOverlay: boolean
}

/* * */

export function getInsetAdjustedSnapPoints(snapPoints: number[], bottomInset: number, sheetHeight: number): number[] {
	if (bottomInset <= 0 || sheetHeight <= 0) return snapPoints;
	return snapPoints.map((point, index) => {
		if (point <= 0 || point >= 1) return point;
		// Preserve distinct partial snaps, with at least one pixel before the next snap.
		const maximum = 1 - (snapPoints.length - 1 - index) / sheetHeight;
		return Math.min(point + bottomInset / sheetHeight, maximum);
	});
}

export function getBottomSheetSnapState(snapPoints: number[], snapIndex: number): BottomSheetSnapState {
	return {
		snapIndex,
		snapPoint: snapPoints[snapIndex] ?? null,
	};
}

export function getMapInteractionCollapseTarget(params: GetMapInteractionCollapseTargetParams) {
	if (!params.hasOriginalEvent) return null;
	if (params.snapIndex === null || params.snapIndex <= params.compactSnapIndex) return null;
	return params.compactSnapIndex;
}

export function shouldShowBottomSheetOverlay(params: ShouldShowBottomSheetOverlayParams) {
	if (params.withOverlay) return true;
	if (params.snapIndex === null) return false;
	return params.snapPoints[params.snapIndex] === 1;
}
