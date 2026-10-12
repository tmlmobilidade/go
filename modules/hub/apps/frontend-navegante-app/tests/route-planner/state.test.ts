import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { type PersistedRoute } from '@/utils/persistence/app-state';
import { createRoutePlannerState, routePlannerReducer } from '@/utils/route-planner/planning/state';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

const origin: RoutePlannerLocation = { detail: 'Lisboa', label: 'Origem', lat: 38.72, lon: -9.14, type: 'PLACE' };
const destination: RoutePlannerLocation = { detail: 'Lisboa', label: 'Destino', lat: 38.74, lon: -9.16, type: 'PLACE' };
const itinerary: MotisItinerary = { duration: 600, endTime: '2026-10-12T11:10:00Z', id: 'route-1', legs: [], startTime: '2026-10-12T11:00:00Z', transfers: 0 };
const savedRoute: PersistedRoute = {
	destination,
	destinationUsesCurrentLocation: false,
	locationSearchTarget: 'destination',
	origin,
	originUsesCurrentLocation: false,
	selectedItineraryIndex: 1,
	travelTime: { date: '2026-10-12T11:00:00Z', mode: 'departure' },
	viewMode: 'itinerary-detail',
};
const travelTime = { date: new Date(savedRoute.travelTime.date), mode: savedRoute.travelTime.mode };

describe('route planner state transitions', () => {
	it('edits a preview endpoint while preserving endpoints and a return to alternatives', () => {
		let state = routePlannerReducer(createRoutePlannerState(), { location: origin, type: 'select-origin' });
		assert.equal(state.locationSearchTarget, 'destination');
		state = routePlannerReducer(state, { location: destination, returnView: 'results', type: 'select-destination' });
		state = routePlannerReducer(state, { type: 'plan-started', viewMode: 'results' });
		state = routePlannerReducer(state, { index: 2, type: 'preview-itinerary' });
		const preview = state;
		state = routePlannerReducer(state, { target: 'origin', type: 'open-location-search' });

		assert.equal(state.viewMode, 'destination-search');
		assert.equal(state.locationSearchReturnView, 'results');
		assert.equal(state.locationSearchTarget, 'origin');
		assert.equal(state.origin, origin);
		assert.equal(state.destination, destination);
		assert.equal(state.selectedItineraryIndex, 2);
		assert.equal(preview.viewMode, 'itinerary-detail');
	});

	it('keeps place detail as the return destination when an origin is needed', () => {
		let state = routePlannerReducer(createRoutePlannerState(), { location: destination, type: 'open-place' });
		state = routePlannerReducer(state, { returnView: 'place-detail', type: 'require-origin' });
		state = routePlannerReducer(state, { location: origin, type: 'select-origin' });
		state = routePlannerReducer(state, { type: 'plan-started', viewMode: state.locationSearchReturnView });

		assert.equal(state.viewMode, 'place-detail');
		assert.equal(state.wasOpenedFromPlace, true);
		assert.equal(state.selectedItineraryIndex, null);
		assert.equal(state.origin, origin);
		state = routePlannerReducer(state, { index: 0, type: 'select-itinerary' });
		assert.equal(state.viewMode, 'results');
	});

	it('clears pending restoration, errors and trip data while retaining travel preferences', () => {
		const route = { ...savedRoute, origin: null, originUsesCurrentLocation: true };
		let state = routePlannerReducer(createRoutePlannerState(), { destination, origin: null, pendingCurrentLocation: true, route, travelTime, type: 'restore-route' });
		assert.equal(state.pendingCurrentLocationRoute, route);
		assert.equal(state.isRestoringSessionRoute, true);
		assert.equal(state.locationSearchTarget, 'origin');
		state = routePlannerReducer(state, { error: 'Request failed', type: 'plan-error' });
		state = routePlannerReducer(state, { type: 'clear-route' });

		assert.equal(state.origin, null);
		assert.equal(state.destination, null);
		assert.equal(state.pendingCurrentLocationRoute, null);
		assert.equal(state.isRestoringSessionRoute, false);
		assert.equal(state.activeTripItinerary, null);
		assert.equal(state.planError, null);
		assert.equal(state.viewMode, 'destination-search');
		assert.equal(state.travelTime, travelTime);
	});

	it('restores an available preview and falls back when its saved itinerary disappeared', () => {
		const restored = routePlannerReducer(createRoutePlannerState(), { destination, origin, pendingCurrentLocation: false, route: savedRoute, travelTime, type: 'restore-route' });
		const valid = routePlannerReducer(restored, { itineraryCount: 2, route: savedRoute, type: 'restore-result' });
		assert.equal(valid.viewMode, 'itinerary-detail');
		assert.equal(valid.selectedItineraryIndex, 1);
		const missing = routePlannerReducer(restored, { itineraryCount: 1, route: savedRoute, type: 'restore-result' });
		assert.equal(missing.viewMode, 'results');
		assert.equal(missing.selectedItineraryIndex, 0);
		const editing = routePlannerReducer(restored, { target: 'destination', type: 'open-location-search' });
		assert.equal(routePlannerReducer(editing, { itineraryCount: 2, route: savedRoute, type: 'restore-result' }).viewMode, 'destination-search');
	});

	it('preserves the active itinerary and suspended sheet history until the trip ends', () => {
		let state = routePlannerReducer(createRoutePlannerState(), { origin, route: savedRoute, trip: { itinerary, sheetHistory: [{ view: 'search' }, { view: 'routes' }] }, type: 'restore-active-trip' });
		assert.equal(state.isNavigating, true);
		assert.equal(state.activeTripItinerary, itinerary);
		assert.deepEqual(state.tripSheetHistory, [{ view: 'search' }, { view: 'routes' }]);
		state = routePlannerReducer(state, { type: 'end-trip' });
		assert.equal(state.isNavigating, false);
		assert.equal(state.viewMode, 'results');
		assert.equal(state.activeTripItinerary, itinerary);
		assert.deepEqual(state.tripSheetHistory, []);
	});

	it('requests the correct missing endpoint after swapping an incomplete route', () => {
		let state = routePlannerReducer(createRoutePlannerState(), { location: origin, type: 'select-origin' });
		state = routePlannerReducer(state, { type: 'swap-locations' });
		assert.equal(state.origin, null);
		assert.equal(state.destination, origin);
		assert.equal(state.locationSearchTarget, 'origin');
		assert.equal(state.viewMode, 'destination-search');
	});
});
