import type { FeatureCollection, Polygon } from 'geojson';

import { getBaseGeoJsonFeatureCollection, getDistanceBetweenPositions, isValidCoordinatePair, METERS_PER_DEGREE } from '@tmlmobilidade/geo';

/* * */

// Delay (ms) before moving the search pin after editing coordinate fields.
export const COORDINATES_PIN_DEBOUNCE_MS = 400;

// How far (meters) editors may move a stop from its saved coordinates in the modal.
export const STOP_COORDINATE_EDIT_RADIUS_METERS = 50;

// Whether the given point lies outside the allowed edit disk.
export function isLatLngOutsideEditRadius(
	centerLat: number,
	centerLng: number,
	lat: number,
	lng: number,
	maxMeters: number,
): boolean {
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
	return getDistanceBetweenPositions([centerLng, centerLat], [lng, lat]) > maxMeters;
}

export const STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_ID = 'stop-detail-coordinates-edit-radius-warning';

// TODO: Translate using i18n
export const STOP_COORDINATE_EDIT_RADIUS_WARNING_TOAST_TITLE = 'Coordenadas fora da área permitida';
export function getStopCoordinateEditRadiusWarningMessage(): string {
	return `Só pode afastar a paragem até ${String(STOP_COORDINATE_EDIT_RADIUS_METERS)} m da posição guardada. As coordenadas e o ponto no mapa não foram alterados.`;
}

const EDIT_RADIUS_CIRCLE_SEGMENTS = 64;

/**
 * Outer ring for the “dim everything outside the edit circle” mask. Spans the usable world so the
 * overlay covers the full map at any pan/zoom; must not be registered for auto-zoom (see MapOverlayPolygon).
 */
const WORLD_DIM_MASK_OUTER_RING: [number, number][] = [
	[-180, -85],
	[180, -85],
	[180, 85],
	[-180, 85],
	[-180, -85],
];

// Enforces ring winding so MapLibre treats holes correctly (same rules as @mapbox/geojson-rewind, RFC 7946).
function rewindRing(ring: [number, number][], dir: boolean): void {
	if (ring.length < 2) return;
	let area = 0;
	for (let i = 0; i < ring.length; i++) {
		const j = i === 0 ? ring.length - 1 : i - 1;
		const pi = ring[i];
		const pj = ring[j];
		if (!pi || !pj) return;
		area += (pi[0] - pj[0]) * (pj[1] + pi[1]);
	}
	if ((area >= 0) !== !!dir) ring.reverse();
}

// Enforces ring winding so MapLibre treats holes correctly (same rules as @mapbox/geojson-rewind, RFC 7946).
function rewindPolygonRingsForMapLibre(rings: [number, number][][]): void {
	if (rings.length === 0) return;
	const outer = rings[0];
	if (!outer) return;
	rewindRing(outer, true);
	for (let i = 1; i < rings.length; i++) {
		const inner = rings[i];
		if (inner) rewindRing(inner, false);
	}
}

// Closed ring [lng, lat] approximating a geodesic circle (`radiusMeters`) around the center.
function buildEditRadiusCircleRing(
	centerLat: number,
	centerLng: number,
	radiusMeters: number,
	cosLat: number,
): [number, number][] {
	const ring: [number, number][] = [];
	for (let i = 0; i <= EDIT_RADIUS_CIRCLE_SEGMENTS; i++) {
		const angle = (i / EDIT_RADIUS_CIRCLE_SEGMENTS) * 2 * Math.PI;
		const eastM = radiusMeters * Math.cos(angle);
		const northM = radiusMeters * Math.sin(angle);
		const dLat = northM / METERS_PER_DEGREE;
		const dLng = eastM / (METERS_PER_DEGREE * cosLat);
		ring.push([centerLng + dLng, centerLat + dLat]);
	}
	return ring;
}

/**
 * Grey mask covering the **whole map** outside the editable radius (hole = full-opacity basemap inside the circle).
 */
export function getEditRadiusOutsideMaskFeatureCollection(
	centerLat: number,
	centerLng: number,
	radiusMeters: number,
): FeatureCollection<Polygon, { id: string }> {
	const fc = getBaseGeoJsonFeatureCollection<Polygon, { id: string }>();
	const cosLat = Math.cos((centerLat * Math.PI) / 180);
	if (!Number.isFinite(cosLat) || Math.abs(cosLat) < 1e-6) return fc;

	const circleRing = buildEditRadiusCircleRing(centerLat, centerLng, radiusMeters, cosLat);
	const polygonCoordinates: [number, number][][] = [[...WORLD_DIM_MASK_OUTER_RING], [...circleRing]];
	rewindPolygonRingsForMapLibre(polygonCoordinates);

	fc.features = [{
		geometry: {
			coordinates: polygonCoordinates,
			type: 'Polygon',
		},
		properties: { id: 'stop-coordinate-edit-radius-mask' },
		type: 'Feature',
	}];
	return fc;
}

/**
 * GeoJSON polygon approximating a circle on the WGS84 spheroid (small-radius local tangent plane),
 * for map overlays showing the editable radius around the saved stop.
 */
export function getEditRadiusCircleFeatureCollection(
	centerLat: number,
	centerLng: number,
	radiusMeters: number,
): FeatureCollection<Polygon, { id: string }> {
	const fc = getBaseGeoJsonFeatureCollection<Polygon, { id: string }>();
	const cosLat = Math.cos((centerLat * Math.PI) / 180);
	if (!Number.isFinite(cosLat) || Math.abs(cosLat) < 1e-6) return fc;

	const ring = buildEditRadiusCircleRing(centerLat, centerLng, radiusMeters, cosLat);
	const polygonCoordinates: [number, number][][] = [[...ring]];
	rewindPolygonRingsForMapLibre(polygonCoordinates);

	fc.features = [{
		geometry: {
			coordinates: polygonCoordinates,
			type: 'Polygon',
		},
		properties: { id: 'stop-coordinate-edit-radius' },
		type: 'Feature',
	}];
	return fc;
}

// Converts a pair of latitude and longitude to a finite number.
export function toFiniteLngLat(latitude: unknown, longitude: unknown): null | { latitude: number, longitude: number } {
	const latitudeN = typeof latitude === 'number' ? latitude : Number(latitude);
	const longitudeN = typeof longitude === 'number' ? longitude : Number(longitude);
	if (!Number.isFinite(latitudeN) || !Number.isFinite(longitudeN)) return null;
	return { latitude: latitudeN, longitude: longitudeN };
}

// Formats a pair for map search-pin context; '' if values are unusable / outside Portugal.
export function coordinatesToSearchQuery(latitude: unknown, longitude: unknown): string {
	const coords = toFiniteLngLat(latitude, longitude);
	if (!coords || !isValidCoordinatePair(coords.latitude, coords.longitude)) return '';
	return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}
