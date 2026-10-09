import { readPersistedAppSession, readPersistedMapCamera, toPersistedRouteLocation, writePersistedAppSession, writePersistedMapCamera } from '@/utils/persistence/app-state';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';
import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';

/* * */

const values = new Map<string, string>();
const previousWindow = globalThis.window;

before(() => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			localStorage: {
				getItem: (key: string) => values.get(key) ?? null,
				setItem: (key: string, value: string) => values.set(key, value),
			},
		},
	});
});

after(() => {
	Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
});

describe('navegante app state persistence', () => {
	it('restores a camera and rejects an invalid one', () => {
		writePersistedMapCamera({ bearing: 0, latitude: 38.7, longitude: -9.1, zoom: 14 });
		assert.deepEqual(readPersistedMapCamera(), { bearing: 0, latitude: 38.7, longitude: -9.1, zoom: 14 });
		values.set('navegante:map-camera:v1', JSON.stringify({ camera: { bearing: 0, latitude: 200, longitude: -9.1, zoom: 14 }, version: 1 }));
		assert.equal(readPersistedMapCamera(), null);
	});

	it('restores a detail sheet stack and its snap', () => {
		writePersistedAppSession({
			activeTrip: null,
			isMapFiltersOpen: false,
			route: null,
			sheets: [{ entityId: null, view: 'search' }, { entityId: 'stop-1', view: 'stops-detail' }],
			snapIndex: 2,
		});
		assert.deepEqual(readPersistedAppSession(), {
			activeTrip: null,
			isMapFiltersOpen: false,
			route: null,
			sheets: [{ entityId: null, view: 'search' }, { entityId: 'stop-1', view: 'stops-detail' }],
			snapIndex: 2,
		});
	});

	it('keeps a valid active trip without an open sheet', () => {
		const itinerary: MotisItinerary = { duration: 600, endTime: '2026-10-01T11:10:00Z', id: 'active-trip', legs: [{ duration: 600, endTime: '2026-10-01T11:10:00Z', from: { lat: 38.7, lon: -9.2, name: 'Origin' }, legGeometry: { length: 0, points: '', precision: 5 }, mode: 'BUS', realTime: false, scheduled: true, scheduledEndTime: '2026-10-01T11:10:00Z', scheduledStartTime: '2026-10-01T11:00:00Z', startTime: '2026-10-01T11:00:00Z', to: { lat: 38.8, lon: -9.1, name: 'Destination' } }], startTime: '2026-10-01T11:00:00Z', transfers: 0 };
		const activeTrip = { itinerary, sheetHistory: [{ entityId: null, view: 'routes' as const }] };
		writePersistedAppSession({
			activeTrip,
			isMapFiltersOpen: false,
			route: { destination: { detail: '', label: 'Destination', lat: 38.8, lon: -9.1, type: 'PLACE' }, destinationUsesCurrentLocation: false, locationSearchTarget: 'destination', origin: null, originUsesCurrentLocation: true, selectedItineraryIndex: 0, travelTime: { date: new Date().toISOString(), mode: 'now' }, viewMode: 'itinerary-detail' },
			sheets: [],
			snapIndex: null,
		});
		assert.deepEqual(readPersistedAppSession()?.activeTrip, activeTrip);
		assert.deepEqual(readPersistedAppSession()?.sheets, []);
	});

	it('drops expired sessions and route sheets without route context', () => {
		values.set('navegante:app-session:v1', JSON.stringify({ route: null, savedAt: Date.now() - 25 * 60 * 60 * 1_000, sheets: [{ view: 'routes' }], version: 1 }));
		assert.equal(readPersistedAppSession(), null);
		values.set('navegante:app-session:v1', JSON.stringify({ route: null, savedAt: Date.now(), sheets: [{ view: 'routes' }, { entityId: 'line-1', view: 'lines-detail' }], version: 1 }));
		assert.deepEqual(readPersistedAppSession()?.sheets, [{ entityId: 'line-1', view: 'lines-detail' }]);
	});

	it('does not save a current GPS location as a route origin', () => {
		assert.equal(toPersistedRouteLocation({ detail: 'Current location', isCurrentLocation: true, label: 'Here', lat: 38.7, lon: -9.1, type: 'PLACE' }), null);
	});
});
