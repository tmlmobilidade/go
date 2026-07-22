import { buildRoutePlannerItineraryMapData, getMotisItineraryActiveLegIndex, getMotisLegRemainingDistanceMeters, getMotisLegRemainingSeconds, type MotisItinerary, type MotisPlanLeg, type MotisPlanPlace, type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { getRoutePlannerMapFitFeatures } from '@/utils/route-planner-navigation';
import { getRoutePlannerActiveLegProgress } from '@/utils/route-planner-progress';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('active itinerary leg progress', () => {
	it('selects the leg whose geometry is nearest to the user', () => {
		const firstLeg = createLeg([[0, 0], [0.01, 0]]);
		const secondLeg = createLeg([[0.01, 0], [0.01, 0.01]], { mode: 'BUS' });
		const itinerary = createItinerary([firstLeg, secondLeg]);
		const userPosition = [0.0101, 0.007];

		assert.equal(getMotisItineraryActiveLegIndex(itinerary, userPosition, null, null), 1);
		assert.deepEqual(getRoutePlannerActiveLegProgress({
			destination: null,
			itinerary,
			origin: null,
			userPosition,
		}), {
			activeLeg: secondLeg,
			activeLegIndex: 1,
			isTrackingLocation: true,
			remainingDistanceMeters: null,
			remainingMinutes: 10,
		});
	});

	it('falls back to the first leg and its planned totals without a user position', () => {
		const firstLeg = createLeg([[0, 0], [0.009, 0]], { distance: 1000, duration: 600 });
		const secondLeg = createLeg([[0.009, 0], [0.018, 0]], { mode: 'BUS' });

		assert.deepEqual(getRoutePlannerActiveLegProgress({
			destination: null,
			itinerary: createItinerary([firstLeg, secondLeg]),
			origin: null,
			userPosition: null,
		}), {
			activeLeg: firstLeg,
			activeLegIndex: 0,
			isTrackingLocation: false,
			remainingDistanceMeters: 1000,
			remainingMinutes: 10,
		});
	});

	it('returns no progress for an itinerary without legs', () => {
		assert.deepEqual(getRoutePlannerActiveLegProgress({
			destination: null,
			itinerary: createItinerary([]),
			origin: null,
			userPosition: null,
		}), {
			activeLeg: null,
			activeLegIndex: 0,
			isTrackingLocation: false,
			remainingDistanceMeters: null,
			remainingMinutes: null,
		});
	});
});

describe('walking leg progress', () => {
	it('uses the planned walking pace for remaining distance and time', () => {
		const leg = createLeg([[0, 0], [0.009, 0]], { distance: 1000, duration: 600 });
		const halfwayPosition = [0.0045, 0];

		assert.equal(getMotisLegRemainingDistanceMeters(leg, halfwayPosition), 500);
		assert.equal(getMotisLegRemainingSeconds(leg, halfwayPosition), 300);
	});

	it('caps live walking progress at the planned totals', () => {
		const leg = createLeg([[0, 0], [0.009, 0]], { distance: 1000, duration: 600 });
		const positionBeyondTheStart = [-0.009, 0];

		assert.equal(getMotisLegRemainingDistanceMeters(leg, positionBeyondTheStart), 1000);
		assert.equal(getMotisLegRemainingSeconds(leg, positionBeyondTheStart), 600);
	});
});

describe('itinerary geometry presentation', () => {
	it('prefers decoded leg geometry over the places used as a straight-line fallback', () => {
		const geometry = [[-9.15, 38.72], [-9.14, 38.73], [-9.13, 38.74]];
		const leg = createLeg(geometry, {
			from: createPlace('Fallback origin', -8, 37),
			to: createPlace('Fallback destination', -7, 36),
		});

		const mapData = buildRoutePlannerItineraryMapData(createItinerary([leg]), null, null);

		assert.deepEqual(mapData.shapeData.features[0]?.geometry.coordinates, geometry);
		assert.deepEqual(mapData.waypointsData.features.map(feature => feature.geometry.coordinates), [geometry[0], geometry[2]]);
	});

	it('falls back to the route endpoints when detailed leg geometry is empty', () => {
		const origin = createLocation('Origin', -9.2, 38.7);
		const destination = createLocation('Destination', -9.1, 38.8);
		const leg = createLeg([], {
			from: createPlace('Unknown origin', Number.NaN, Number.NaN),
			to: createPlace('Unknown destination', Number.NaN, Number.NaN),
		});

		const mapData = buildRoutePlannerItineraryMapData(createItinerary([leg]), origin, destination);

		assert.deepEqual(mapData.shapeData.features[0]?.geometry.coordinates, [[-9.2, 38.7], [-9.1, 38.8]]);
	});

	it('fits itinerary detail to the first leg only', () => {
		const firstLeg = createLineFeature([[0, 0], [1, 1]]);
		const secondLeg = createLineFeature([[1, 1], [2, 2]]);

		assert.deepEqual(getRoutePlannerMapFitFeatures([firstLeg, secondLeg], 'itinerary-detail'), [firstLeg]);
		assert.deepEqual(getRoutePlannerMapFitFeatures([firstLeg, secondLeg], 'results'), [firstLeg, secondLeg]);
	});
});

/* * */

function createItinerary(legs: MotisPlanLeg[]): MotisItinerary {
	return {
		duration: legs.reduce((total, leg) => total + leg.duration, 0),
		endTime: '2026-01-01T10:30:00.000Z',
		id: 'itinerary-id',
		legs,
		startTime: '2026-01-01T10:00:00.000Z',
		transfers: Math.max(0, legs.length - 1),
	};
}

function createLeg(positions: GeoJSON.Position[], overrides: Partial<MotisPlanLeg> = {}): MotisPlanLeg {
	const fromPosition = positions[0] ?? [0, 0];
	const toPosition = positions[positions.length - 1] ?? [0, 0];

	return {
		distance: 1000,
		duration: 600,
		endTime: '2026-01-01T10:10:00.000Z',
		from: createPlace('Origin', fromPosition[0], fromPosition[1]),
		legGeometry: {
			length: positions.length,
			points: encodePolyline(positions),
			precision: 5,
		},
		mode: 'WALK',
		realTime: false,
		scheduled: true,
		scheduledEndTime: '2026-01-01T10:10:00.000Z',
		scheduledStartTime: '2026-01-01T10:00:00.000Z',
		startTime: '2026-01-01T10:00:00.000Z',
		to: createPlace('Destination', toPosition[0], toPosition[1]),
		...overrides,
	};
}

function createPlace(name: string, lon: number, lat: number): MotisPlanPlace {
	return { lat, lon, name };
}

function createLocation(label: string, lon: number, lat: number): RoutePlannerLocation {
	return {
		detail: '',
		label,
		lat,
		lon,
		type: 'PLACE',
	};
}

function createLineFeature(coordinates: GeoJSON.Position[]): GeoJSON.Feature<GeoJSON.LineString> {
	return {
		geometry: { coordinates, type: 'LineString' },
		properties: {},
		type: 'Feature',
	};
}

function encodePolyline(positions: GeoJSON.Position[], precision = 5) {
	const factor = 10 ** precision;
	let previousLat = 0;
	let previousLon = 0;

	return positions.map(([lon, lat]) => {
		const currentLat = Math.round(lat * factor);
		const currentLon = Math.round(lon * factor);
		const value = encodePolylineDelta(currentLat - previousLat) + encodePolylineDelta(currentLon - previousLon);
		previousLat = currentLat;
		previousLon = currentLon;
		return value;
	}).join('');
}

function encodePolylineDelta(delta: number) {
	let value = delta < 0 ? ~(delta << 1) : delta << 1;
	let encoded = '';

	while (value >= 0x20) {
		encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
		value >>= 5;
	}

	return encoded + String.fromCharCode(value + 63);
}
