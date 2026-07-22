import { type BottomSheetSnapState } from '@/types/bottom-sheet';

/* * */

interface GetMapInteractionCollapseTargetParams {
	compactSnapIndex: number
	hasOriginalEvent: boolean
	snapIndex: null | number
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
