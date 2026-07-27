export type FeedbackSheetView = 'categories' | 'mood' | 'reasons' | 'thank-you';

/* * */

const FEEDBACK_TRIGGER_MINIMUM_SNAP_POINT = 0.5;

/* * */

export function getFeedbackBackTarget(currentView: FeedbackSheetView, reasonCategoryCount: number): FeedbackSheetView | null {
	if (currentView === 'categories') return 'mood';
	if (currentView === 'reasons') return reasonCategoryCount > 1 ? 'categories' : 'mood';

	return null;
}

export function getFeedbackReasonSelectionTarget(reasonCategoryCount: number): FeedbackSheetView {
	return reasonCategoryCount === 1 ? 'reasons' : 'categories';
}

export function shouldShowFeedbackTrigger(snapPoint: null | number, isFeedbackSheetOpen: boolean, isCoolingDown: boolean) {
	return snapPoint !== null && snapPoint >= FEEDBACK_TRIGGER_MINIMUM_SNAP_POINT && !isFeedbackSheetOpen && !isCoolingDown;
}
