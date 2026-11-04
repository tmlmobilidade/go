import { getAgencyDisplayInfo } from '@/lib/agency-catalog';
import { getBaseMapAlertsMapData, getBaseMapVehiclesMapData } from '@/utils/map/base-map-data';
import { BASE_MAP_OPERATOR_IDS, getBaseMapOperatorId, isBaseMapAgencyVisible } from '@/utils/map/base-map-operators';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('base-map operator normalization', () => {
	it('defines agency metadata for every selectable operator', () => {
		for (const operatorId of BASE_MAP_OPERATOR_IDS) {
			assert.ok(getAgencyDisplayInfo(operatorId));
		}
	});

	it('groups Carris Metropolitana agencies under CM', () => {
		for (const agencyId of ['A2L1N', 'BNA17', 'LA77N', 'YA15B']) {
			assert.equal(getBaseMapOperatorId(agencyId), 'CM');
		}
	});

	it('preserves configured operator IDs and leaves unknown agencies ungrouped', () => {
		assert.equal(getBaseMapOperatorId('IA2N9'), 'IA2N9');
		assert.equal(getBaseMapOperatorId('CM'), 'CM');
		assert.equal(getBaseMapOperatorId('unknown-agency'), null);
	});

	it('hides every CM agency together while keeping unknown agencies visible', () => {
		for (const agencyId of ['A2L1N', 'BNA17', 'LA77N', 'YA15B']) {
			assert.equal(isBaseMapAgencyVisible(agencyId, ['CM']), false);
		}

		assert.equal(isBaseMapAgencyVisible('unknown-agency', ['CM']), true);
	});
});

describe('base-map alert filtering order', () => {
	const alerts = [
		{ _id: 'route-alert', agency_id: 'IA2N9' },
		{ _id: 'focused-alert', agency_id: 'KB1F6' },
		{ _id: 'cm-alert', agency_id: 'LA77N' },
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

	it('keeps itinerary alerts visible and adds the focused alert', () => {
		const result = getBaseMapAlertsMapData({
			alerts,
			alertsData,
			excludedOperatorIds: [],
			focusedAlertId: 'focused-alert',
			routePlannerAlertsData,
		});

		assert.deepEqual(getFeatureIds(result), ['route-alert', 'cm-alert', 'focused-alert']);
		assert.deepEqual(
			result.features.map(feature => feature.properties?.is_focused),
			[false, false, true],
		);
		assert.deepEqual(
			result.features.map(feature => feature.properties?.is_dimmed),
			[true, true, false],
		);
	});

	it('applies operator visibility while preserving the focused alert marker', () => {
		const result = getBaseMapAlertsMapData({
			alerts,
			alertsData,
			excludedOperatorIds: ['CM'],
			focusedAlertId: 'cm-alert',
			routePlannerAlertsData,
		});

		assert.deepEqual(getFeatureIds(result), ['route-alert', 'cm-alert']);
		assert.deepEqual(
			result.features.map(feature => feature.properties?.is_focused),
			[false, true],
		);
	});
});

describe('base-map vehicle filtering order', () => {
	const vehiclesData = createVehicleCollection([
		{ agency_id: 'IA2N9', direction_id: 0, pattern_id: 'pattern-a', route_id: 'route-a', route_short_name: '100', shape_id: 'route-shape', trip_id: 'trip-a', vehicle_id: 'route-vehicle' },
		{ agency_id: 'KB1F6', direction_id: 1, pattern_id: 'pattern-b', route_id: 'route-b', route_short_name: '200', shape_id: 'line-shape', trip_id: 'trip-b-selected', vehicle_id: 'line-vehicle' },
		{ agency_id: 'KB1F6', direction_id: 0, pattern_id: 'pattern-b-return', route_id: 'route-b-return', route_short_name: '200', shape_id: 'return-shape', trip_id: 'trip-b-return', vehicle_id: 'return-vehicle' },
		{ agency_id: 'KB1F6', direction_id: 1, pattern_id: 'pattern-b', route_id: 'new-route-b', route_short_name: '200', shape_id: 'new-shape', trip_id: 'trip-b-other-version', vehicle_id: 'new-vehicle' },
		{ agency_id: 'KB1F6', direction_id: 1, pattern_id: 'pattern-b', route_id: 'other-route', route_short_name: '201', shape_id: 'line-shape', trip_id: 'trip-b-selected', vehicle_id: 'other-line-vehicle' },
		{ agency_id: 'IA2N9', direction_id: 1, pattern_id: 'pattern-b', route_id: 'other-agency-route', route_short_name: '200', shape_id: 'other-agency-shape', trip_id: 'trip-b-selected', vehicle_id: 'other-agency-vehicle' },
		{ agency_id: 'IA9T6', direction_id: 1, pattern_id: 'pattern-c', route_id: 'route-c', shape_id: 'focused-shape', trip_id: 'trip-c', vehicle_id: 'focused-vehicle' },
		{ agency_id: 'LA77N', direction_id: 0, pattern_id: 'pattern-d', route_id: 'route-d', shape_id: 'cm-shape', trip_id: 'trip-d', vehicle_id: 'cm-vehicle' },
		{ agency_id: 'unknown-agency', direction_id: 0, pattern_id: 'pattern-e', route_id: 'route-e', shape_id: 'unknown-shape', trip_id: 'trip-e', vehicle_id: 'unknown-vehicle' },
	]);
	const routePlannerRouteDirections = new Set(['[IA2N9]route-a:0']);
	const lineDetailLine = {
		line: { agency_id: 'KB1F6', route_ids: ['route-b', 'route-b-return'], short_name: '200' },
		pattern: { id: 'pattern-b', tripIds: new Set(['trip-b-selected']) },
	};

	it('starts from vehicles matching the selected itinerary route and direction', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailLine: null,
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['route-vehicle']);
	});

	it('shows only vehicles assigned to a trip in the selected pattern version', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailLine,
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['line-vehicle']);
	});

	it('updates visible vehicles when another pattern is selected', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailLine: { line: lineDetailLine.line, pattern: { id: 'pattern-b-return', tripIds: new Set(['trip-b-return']) } },
			routePlannerRouteDirections: null,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['return-vehicle']);
	});

	it('shows no unrelated vehicles while the selected line is loading', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailLine: { line: undefined, pattern: lineDetailLine.pattern },
			routePlannerRouteDirections: null,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), []);
	});

	it('shows no line vehicles while the selected pattern is loading', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailLine: { line: lineDetailLine.line, pattern: null },
			routePlannerRouteDirections: null,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), []);
	});

	it('keeps selected pattern vehicles visible and adds the focused vehicle', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: 'focused-vehicle',
			lineDetailLine,
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['line-vehicle', 'focused-vehicle']);
		assert.deepEqual(
			result.features.map(feature => feature.properties.is_focused),
			[false, true],
		);
		assert.deepEqual(
			result.features.map(feature => feature.properties.is_dimmed),
			[true, false],
		);
	});

	it('marks all vehicles as dots while a stop or alert is selected', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: [],
			focusedVehicleId: null,
			lineDetailLine: null,
			routePlannerRouteDirections: null,
			showVehiclesAsDots: true,
			vehiclesData,
		});

		assert.ok(result.features.every(feature => feature.properties.is_dimmed));
	});

	it('applies grouped operator visibility last and keeps unknown agencies visible', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: ['CM'],
			focusedVehicleId: null,
			lineDetailLine: null,
			routePlannerRouteDirections: null,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['route-vehicle', 'line-vehicle', 'return-vehicle', 'new-vehicle', 'other-line-vehicle', 'other-agency-vehicle', 'focused-vehicle', 'unknown-vehicle']);
	});

	it('applies operator visibility while preserving the focused vehicle marker', () => {
		const result = getBaseMapVehiclesMapData({
			excludedOperatorIds: ['IA9T6'],
			focusedVehicleId: 'focused-vehicle',
			lineDetailLine,
			routePlannerRouteDirections,
			vehiclesData,
		});

		assert.deepEqual(getVehicleIds(result), ['line-vehicle', 'focused-vehicle']);
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
	is_dimmed?: boolean
	is_focused?: boolean
	pattern_id: string
	route_id: string
	route_short_name?: string
	shape_id: string
	trip_id: string
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
