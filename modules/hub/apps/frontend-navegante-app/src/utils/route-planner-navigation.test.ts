import { getRoutePlannerCloseAction } from '@/utils/route-planner-navigation';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('getRoutePlannerCloseAction', () => {
	it('returns to route results when location search is dismissed with an existing route', () => {
		const action = getRoutePlannerCloseAction({
			hasRouteContext: true,
			isNavigating: false,
			viewMode: 'destination-search',
			wasOpenedFromPlace: false,
		});

		assert.equal(action, 'open-results');
	});

	it('closes an initial location search that has no route context', () => {
		const action = getRoutePlannerCloseAction({
			hasRouteContext: false,
			isNavigating: false,
			viewMode: 'destination-search',
			wasOpenedFromPlace: false,
		});

		assert.equal(action, 'close-sheet');
	});

	it('preserves the existing results and itinerary-detail close transitions', () => {
		assert.equal(getRoutePlannerCloseAction({
			hasRouteContext: true,
			isNavigating: false,
			viewMode: 'results',
			wasOpenedFromPlace: false,
		}), 'clear-route');

		assert.equal(getRoutePlannerCloseAction({
			hasRouteContext: true,
			isNavigating: false,
			viewMode: 'results',
			wasOpenedFromPlace: true,
		}), 'open-place-detail');

		assert.equal(getRoutePlannerCloseAction({
			hasRouteContext: true,
			isNavigating: false,
			viewMode: 'itinerary-detail',
			wasOpenedFromPlace: false,
		}), 'open-results');

		assert.equal(getRoutePlannerCloseAction({
			hasRouteContext: true,
			isNavigating: true,
			viewMode: 'itinerary-detail',
			wasOpenedFromPlace: false,
		}), 'dismiss-trip-sheets');
	});
});
