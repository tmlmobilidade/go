import { type RoutePlannerViewMode } from '@/components/routes/RoutePlanner.context';

/* * */

export type RoutePlannerCloseAction = 'clear-route' | 'close-sheet' | 'dismiss-trip-sheets' | 'open-place-detail' | 'open-results';

interface GetRoutePlannerCloseActionOptions {
	hasRouteContext: boolean
	isNavigating: boolean
	viewMode: RoutePlannerViewMode
	wasOpenedFromPlace: boolean
}

/* * */

export function getRoutePlannerCloseAction({ hasRouteContext, isNavigating, viewMode, wasOpenedFromPlace }: GetRoutePlannerCloseActionOptions): RoutePlannerCloseAction {
	if (viewMode === 'itinerary-detail') return isNavigating ? 'dismiss-trip-sheets' : 'open-results';
	if (viewMode === 'results') return wasOpenedFromPlace ? 'open-place-detail' : 'clear-route';
	if (viewMode === 'destination-search' && hasRouteContext) return 'open-results';

	return 'close-sheet';
}
