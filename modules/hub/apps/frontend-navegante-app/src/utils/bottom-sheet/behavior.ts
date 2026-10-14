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
