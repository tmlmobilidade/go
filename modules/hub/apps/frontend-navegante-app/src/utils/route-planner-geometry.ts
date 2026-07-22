import { getMotisLegModeKind, getMotisLegRouteLabel } from '@/utils/route-planner-modes';
import { type MotisItinerary, type MotisPlanLeg, type MotisPlanPlace, type RoutePlannerItineraryMapData, type RoutePlannerItineraryMapDataOptions, type RoutePlannerLocation } from '@/utils/route-planner.types';

/* * */

export function buildRoutePlannerItineraryMapData(itinerary: MotisItinerary | null, origin: null | RoutePlannerLocation, destination: null | RoutePlannerLocation, options?: RoutePlannerItineraryMapDataOptions): RoutePlannerItineraryMapData {
	const shapeData = getEmptyLineStringFeatureCollection();
	const waypointsData = getEmptyPointFeatureCollection();
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];

	legs.forEach((leg, index) => {
		const positions = getMotisLegPathPositions(leg, index, legs.length, origin, destination);
		if (positions.length < 2) return;

		shapeData.features.push({
			geometry: {
				coordinates: positions,
				type: 'LineString',
			},
			properties: {
				color: getRoutePlannerLegColor(leg, options),
				leg_index: index,
				route_label: getMotisLegRouteLabel(leg),
				text_color: getRoutePlannerLegTextColor(leg, options),
			},
			type: 'Feature',
		});

		if (index === 0) {
			waypointsData.features.push(getRoutePlannerWaypointFeature(positions[0], leg));
		}

		waypointsData.features.push(getRoutePlannerWaypointFeature(positions[positions.length - 1], leg));
	});

	return { shapeData, waypointsData };
}

export function getMotisLegPathPositions(leg: MotisPlanLeg, index: number, totalLegs: number, origin: null | RoutePlannerLocation, destination: null | RoutePlannerLocation) {
	const geometryPositions = getMotisLegGeometryPositions(leg);
	const fallbackPositions = getMotisLegFallbackPositions(leg, index, totalLegs, origin, destination);

	return geometryPositions.length >= 2 ? geometryPositions : fallbackPositions;
}

export function getMotisPlanPlacePosition(place: MotisPlanPlace | undefined): GeoJSON.Position | null {
	if (!place) return null;
	return getPositionFromLatLon(place.lat, place.lon);
}

/* * */

function getEmptyLineStringFeatureCollection(): GeoJSON.FeatureCollection<GeoJSON.LineString> {
	return {
		features: [],
		type: 'FeatureCollection',
	};
}

function getEmptyPointFeatureCollection(): GeoJSON.FeatureCollection<GeoJSON.Point> {
	return {
		features: [],
		type: 'FeatureCollection',
	};
}

function getMotisLegFallbackPositions(leg: MotisPlanLeg, index: number, totalLegs: number, origin: null | RoutePlannerLocation, destination: null | RoutePlannerLocation) {
	const fromPosition = getMotisPlanPlacePosition(leg.from) || (index === 0 ? getRoutePlannerLocationPosition(origin) : null);
	const toPosition = getMotisPlanPlacePosition(leg.to) || (index === totalLegs - 1 ? getRoutePlannerLocationPosition(destination) : null);

	return [fromPosition, toPosition].filter(isGeoJsonPosition);
}

function getMotisLegGeometryPositions(leg: MotisPlanLeg) {
	const candidates: unknown[] = [leg.legGeometry];

	for (const candidate of candidates) {
		const positions = getPositionsFromGeometryCandidate(candidate);
		if (positions.length >= 2) return positions;
	}

	return [];
}

function getPositionFromLatLon(lat: number | undefined, lon: number | undefined): GeoJSON.Position | null {
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
	return [lon as number, lat as number];
}

function getPositionsFromGeometryCandidate(candidate: unknown): GeoJSON.Position[] {
	if (typeof candidate === 'string') return decodePolyline(candidate);
	if (!isRecord(candidate)) return [];

	const precision = typeof candidate.precision === 'number' ? candidate.precision : undefined;
	const type = typeof candidate.type === 'string' ? candidate.type : null;
	if (type === 'LineString' && Array.isArray(candidate.coordinates)) {
		return normalizeGeoJsonPositions(candidate.coordinates);
	}

	if (Array.isArray(candidate.coordinates)) {
		return normalizeGeoJsonPositions(candidate.coordinates);
	}

	if (typeof candidate.points === 'string') return decodePolyline(candidate.points, precision);
	if (typeof candidate.encodedPolyline === 'string') return decodePolyline(candidate.encodedPolyline, precision);
	if (typeof candidate.polyline === 'string') return decodePolyline(candidate.polyline, precision);

	return [];
}

function getRoutePlannerLegColor(leg: MotisPlanLeg, options?: RoutePlannerItineraryMapDataOptions) {
	const modeKind = getMotisLegModeKind(leg);
	const lineStyle = options?.lineStyleByShortName?.get(getMotisLegRouteLabel(leg));

	if (modeKind === 'walk') return '#6b7280';
	if (lineStyle?.color) return lineStyle.color;
	if (modeKind === 'bus') return '#2dc76d';
	if (modeKind === 'ferry') return '#0b76c5';
	if (modeKind === 'subway') return '#7f35d8';
	if (modeKind === 'tram') return '#f0a000';

	return '#0d168f';
}

function getRoutePlannerLegTextColor(leg: MotisPlanLeg, options?: RoutePlannerItineraryMapDataOptions) {
	const modeKind = getMotisLegModeKind(leg);
	const lineStyle = options?.lineStyleByShortName?.get(getMotisLegRouteLabel(leg));

	if (modeKind === 'walk') return '#ffffff';
	return lineStyle?.text_color || '#ffffff';
}

function getRoutePlannerLocationPosition(location: null | RoutePlannerLocation): GeoJSON.Position | null {
	if (!location) return null;
	return getPositionFromLatLon(location.lat, location.lon);
}

function getRoutePlannerWaypointFeature(position: GeoJSON.Position, leg: MotisPlanLeg): GeoJSON.Feature<GeoJSON.Point> {
	return {
		geometry: {
			coordinates: position,
			type: 'Point',
		},
		properties: {
			color: getRoutePlannerLegColor(leg),
			text_color: '#ffffff',
		},
		type: 'Feature',
	};
}

function decodePolyline(value: string, precision = 5): GeoJSON.Position[] {
	const positions: GeoJSON.Position[] = [];
	let index = 0;
	let lat = 0;
	let lon = 0;
	const factor = 10 ** precision;

	while (index < value.length) {
		const latResult = decodePolylineCoordinate(value, index);
		if (!latResult) return positions;
		index = latResult.nextIndex;
		lat += latResult.delta;

		const lonResult = decodePolylineCoordinate(value, index);
		if (!lonResult) return positions;
		index = lonResult.nextIndex;
		lon += lonResult.delta;

		const position: GeoJSON.Position = [lon / factor, lat / factor];
		if (isGeoJsonPosition(position)) positions.push(position);
	}

	return positions;
}

function decodePolylineCoordinate(value: string, startIndex: number) {
	let result = 0;
	let shift = 0;
	let index = startIndex;
	let byte: number;

	do {
		if (index >= value.length) return null;
		byte = value.charCodeAt(index) - 63;
		index += 1;
		result |= (byte & 0x1f) << shift;
		shift += 5;
	} while (byte >= 0x20);

	const delta = (result & 1) ? ~(result >> 1) : (result >> 1);
	return { delta, nextIndex: index };
}

function isGeoJsonPosition(value: unknown): value is GeoJSON.Position {
	if (!Array.isArray(value) || value.length < 2) return false;

	const lon = value[0];
	const lat = value[1];

	return (
		typeof lon === 'number'
		&& typeof lat === 'number'
		&& Number.isFinite(lon)
		&& Number.isFinite(lat)
		&& lon >= -180
		&& lon <= 180
		&& lat >= -90
		&& lat <= 90
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function normalizeGeoJsonPositions(value: unknown[]) {
	return value.filter(isGeoJsonPosition);
}
