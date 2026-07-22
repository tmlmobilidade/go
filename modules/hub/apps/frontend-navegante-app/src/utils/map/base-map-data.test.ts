import { getBaseMapAlertsMapData, getBaseMapVehiclesMapData } from '@/utils/map/base-map-data';
import { getBaseMapOperatorId, isBaseMapAgencyVisible } from '@/utils/map/base-map-operators';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('base-map operator normalization', () => {
	it('groups Carris Metropolitana agencies 41 through 44 under CM', () => {
		for (const agencyId of ['41', '42', '43', '44']) {
			assert.equal(getBaseMapOperatorId(agencyId), 'CM');
		}
	});

	it('preserves configured operator IDs and leaves unknown agencies ungrouped', () => {
		assert.equal(getBaseMapOperatorId('2'), '2');
		assert.equal(getBaseMapOperatorId('CM'), 'CM');
		assert.equal(getBaseMapOperatorId('unknown-agency'), null);
	});

	it('hides every CM agency together while keeping unknown agencies visible', () => {
		for (const agencyId of ['41', '42', '43', '44']) {
			assert.equal(isBaseMapAgencyVisible(agencyId, ['CM']), false);
		}

		assert.equal(isBaseMapAgencyVisible('unknown-agency', ['CM']), true);
	});
});

describe('base-map alert filtering order', () => {
	const alerts = [
		{ _id: 'route-alert', agency_id: '2' },
		{ _id: 'focused-alert', agency_id: '3' },
		{ _id: 'cm-alert', agency_id: '41' },
	];
	const alertsData = createAlertCollection(['route-alert', 'focused-alert', 'cm-alert']);
	const routePlannerAlertsData = createAlertCollection(['route-alert', 'cm-alert']);

	it('starts from the selected itinerary alert collection', () => {
		const result = getBaseMapAlertsMapData({
			alerts,
			alertsData,
			excludedOperatorIds: [],
			focusedAlertId: null,
			routePlannerAlertsData,
		});

		assert.deepEqual(getFeatureIds(result), ['route-alert', 'cm-alert']);
	});

	it('lets a focused alert override the selected itinerary collection', () => {
		const result = getBaseMapAlertsMapData({
			alerts,
			alertsData,
			excludedOperatorIds: [],
			focusedAlertId: 'focused-alert',
			routePlannerAlertsData,
		});

		assert.deepEqual(getFeatureIds(result), ['focused-alert']);
	});

	it('applies operator visibility after the focused-alert override', () => {
		const result = getBaseMapAlertsMapData({
			alerts,
			alertsData,
			excludedOperatorIds: ['CM'],
			focusedAlertId: 'cm-alert',
			routePlannerAlertsData,
		});

		assert.deepEqual(getFeatureIds(result), []);
	});
});

describe('base-map vehicle filtering order', () => {
	const vehiclesData = createVehicleCollection([
		{ agency_id: '2', direction_id: 0, pattern_id: 'route-pattern', route_id: 'route-a', vehicle_id: 'route-vehicle' },
		{ agency_id: '3', direction_id: 1, pattern_id: 'line-pattern', route_id: 'route-b', vehicle_id: 'line-vehicle' },
		{ agency_id: '4', direction_id: 1, pattern_id: 'focused-pattern', route_id: 'route-c', vehicle_id: 'focused-vehicle' },
		{ agency_id: '41', direction_id: 0, pattern_id: 'cm-pattern', route_id: 'route-d', vehicle_id: 'cm-vehicle' },
		{ agency_id: 'unknown-agency', direction_id: 0, pattern_id: 'unknown-pattern', route_id: 'route-e', vehicle_id: 'unknown-vehicle' },
	]);
	const routePlannerRouteDirections = new Set(['[2]route-a:0']);

	it('starts from vehicles matching the selected itinerary route and direction', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailPatternIds: null,
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['route-vehicle']);
	});

	it('lets a selected line pattern override itinerary vehicle filtering', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailPatternIds: new Set(['line-pattern']),
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['line-vehicle']);
	});

	it('lets a focused vehicle override line and itinerary filtering', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: 'focused-vehicle',
			lineDetailPatternIds: new Set(['line-pattern']),
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['focused-vehicle']);
	});

	it('applies grouped operator visibility last and keeps unknown agencies visible', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: ['CM'],
			focusedVehicleId: null,
			lineDetailPatternIds: null,
			routePlannerRouteDirections: null,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['route-vehicle', 'line-vehicle', 'focused-vehicle', 'unknown-vehicle']);
	});

	it('allows operator visibility to hide an otherwise focused vehicle', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: ['4'],
			focusedVehicleId: 'focused-vehicle',
			lineDetailPatternIds: new Set(['line-pattern']),
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), []);
	});
});

/* * */

function createAlertCollection(alertIds: string[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
	return {
		features: alertIds.map((alertId, index) => ({
			geometry: { coordinates: [index, index], type: 'Point' },
			properties: { _id: alertId },
			type: 'Feature',
		})),
		type: 'FeatureCollection',
	};
}

interface VehicleProperties {
	agency_id: string
	direction_id: number
	pattern_id: string
	route_id: string
	vehicle_id: string
}

function createVehicleCollection(vehicles: VehicleProperties[]): GeoJSON.FeatureCollection<GeoJSON.Point, VehicleProperties> {
	return {
		features: vehicles.map((vehicle, index) => ({
			geometry: { coordinates: [index, index], type: 'Point' },
			properties: vehicle,
			type: 'Feature',
		})),
		type: 'FeatureCollection',
	};
}

function getFeatureIds(collection: GeoJSON.FeatureCollection) {
	return collection.features.map(feature => feature.properties?._id);
}

function getVehicleIds<TProperties extends { vehicle_id?: null | string }>(collection: GeoJSON.FeatureCollection<GeoJSON.Point, TProperties>) {
	return collection.features.map(feature => feature.properties?.vehicle_id);
}
