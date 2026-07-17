import type { Area as MotisApiArea, GeocodeResponse as MotisApiGeocodeResponse, Itinerary as MotisApiItinerary,	Leg as MotisApiLeg, Place as MotisApiPlace, PlanResponse as MotisApiPlanResponse } from '@/types/motis-api';

/* * */

export type RoutePlannerTravelTimeMode = 'arrival' | 'departure' | 'now';

/* * */

export type MotisGeocodeArea = Partial<MotisApiArea>;

export type MotisGeocodeResult = MotisApiGeocodeResponse[number];

export interface RoutePlannerLocation {
	areas?: MotisGeocodeArea[]
	category?: string
	country?: string
	detail: string
	houseNumber?: string
	id?: string
	label: string
	lat?: number
	level?: number
	lon?: number
	modes?: string[]
	street?: string
	type: string
	zip?: string
}

export type MotisPlanPlace = MotisApiPlace;
export type MotisPlanIntermediateStop = MotisApiPlace;
export type MotisPlanLeg = MotisApiLeg;
export type MotisItinerary = MotisApiItinerary;
export type MotisPlanResponse = MotisApiPlanResponse;

export interface RoutePlannerTravelTime {
	date: Date
	mode: RoutePlannerTravelTimeMode
}

export interface RoutePlannerItineraryMapData {
	shapeData: GeoJSON.FeatureCollection<GeoJSON.LineString>
	waypointsData: GeoJSON.FeatureCollection<GeoJSON.Point>
}

interface RoutePlannerItineraryMapDataOptions {
	lineStyleByShortName?: Map<string, { color?: string, text_color?: string }>
}

/* * */

export function buildMotisPlanParams(origin: RoutePlannerLocation, destination: RoutePlannerLocation, travelTime: RoutePlannerTravelTime) {
	const requestDate = travelTime.mode === 'now' ? new Date() : travelTime.date;

	const params = new URLSearchParams({
		detailedLegs: 'true',
		directModes: 'WALK',
		fromPlace: getMotisPlaceParam(origin),
		maxItineraries: '10',
		postTransitModes: 'WALK',
		preTransitModes: 'WALK',
		time: requestDate.toISOString(),
		toPlace: getMotisPlaceParam(destination),
		transitModes: 'TRANSIT',
	});

	if (travelTime.mode === 'arrival') {
		params.set('arriveBy', 'true');
	}

	return params;
}
export function buildRoutePlannerItineraryMapData(itinerary: MotisItinerary | null, origin: null | RoutePlannerLocation, destination: null | RoutePlannerLocation, options?: RoutePlannerItineraryMapDataOptions): RoutePlannerItineraryMapData {
	const shapeData = getEmptyLineStringFeatureCollection();
	const waypointsData = getEmptyPointFeatureCollection();
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];

	legs.forEach((leg, index) => {
		const geometryPositions = getMotisLegGeometryPositions(leg);
		const fallbackPositions = getMotisLegFallbackPositions(leg, index, legs.length, origin, destination);
		const positions = geometryPositions.length >= 2 ? geometryPositions : fallbackPositions;

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

export function formatMotisLocationDetail(location: MotisGeocodeResult | RoutePlannerLocation) {
	const label = 'label' in location ? location.label : location.name;
	const street = [
		getUsefulLocationPart(location.street),
		getUsefulLocationPart(location.houseNumber),
	].filter(Boolean).join(' ');
	const areaNames = getMotisAreaNames(location.areas, [label, street]);
	const locality = [getUsefulLocationPart(location.zip), ...areaNames].filter(Boolean).join(' ');

	return [street, locality].filter(Boolean).join(' · ');
}

export function formatMotisPlanDuration(seconds: number | undefined) {
	if (!Number.isFinite(seconds)) return null;

	const minutes = Math.round((seconds || 0) / 60);
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes} min`;
}

export function formatMotisPlanDurationMinutes(seconds: number | undefined) {
	if (!Number.isFinite(seconds)) return null;
	return Math.max(0, Math.round((seconds || 0) / 60));
}

export function formatMotisPlanTime(value: string | undefined) {
	if (!value) return '--:--';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '--:--';

	return new Intl.DateTimeFormat(undefined, {
		hour: '2-digit',
		hour12: false,
		minute: '2-digit',
	}).format(date);
}

export function getMotisItineraries(plan: MotisPlanResponse | null) {
	if (!plan) return [];
	if (Array.isArray(plan.itineraries)) return plan.itineraries;
	return [];
}

export function getMotisItineraryEnd(itinerary: MotisItinerary) {
	return itinerary.endTime;
}

export function getMotisItineraryStart(itinerary: MotisItinerary) {
	return itinerary.startTime;
}

export function getMotisItineraryDurationSeconds(itinerary: MotisItinerary) {
	if (Number.isFinite(itinerary.duration)) return itinerary.duration;
	return getSecondsBetween(getMotisItineraryStart(itinerary), getMotisItineraryEnd(itinerary));
}

export function getMotisItineraryWalkMinutes(legs: MotisPlanLeg[]) {
	const walkingSeconds = legs.reduce((total, leg) => {
		if (!isMotisWalkingLeg(leg)) return total;
		return total + (getMotisLegDurationSeconds(leg) || 0);
	}, 0);

	return Math.max(0, Math.round(walkingSeconds / 60));
}

export function getMotisLegDetail(leg: MotisPlanLeg, fallbackOrigin: string, fallbackDestination: string) {
	const from = leg.from.name || fallbackOrigin;
	const to = leg.to.name || fallbackDestination;
	const start = formatMotisPlanTime(leg.startTime);
	const end = formatMotisPlanTime(leg.endTime);

	return `${start} -> ${end} | ${from} -> ${to}`;
}

export function getMotisLegDurationSeconds(leg: MotisPlanLeg) {
	if (Number.isFinite(leg.duration)) return leg.duration;
	return getSecondsBetween(leg.startTime, leg.endTime);
}

export function getMotisLegMode(leg: MotisPlanLeg) {
	return leg.mode.toUpperCase();
}

export function getMotisLegModeKind(leg: MotisPlanLeg) {
	const mode = getMotisLegMode(leg);

	if (['FOOT', 'WALK'].includes(mode)) return 'walk';
	if (mode.includes('BUS')) return 'bus';
	if (mode.includes('BICYCLE') || mode.includes('BIKE')) return 'bike';
	if (mode.includes('CAR') || mode.includes('TAXI')) return 'car';
	if (mode.includes('SUBWAY') || mode.includes('METRO')) return 'subway';
	if (mode.includes('TRAM') || mode.includes('LIGHT_RAIL')) return 'tram';
	if (mode.includes('RAIL') || mode.includes('TRAIN')) return 'rail';
	if (mode.includes('FERRY') || mode.includes('BOAT')) return 'ferry';
	if (mode.includes('PLANE') || mode.includes('AIR')) return 'plane';
	if (mode.includes('SCOOTER')) return 'scooter';
	if (mode.includes('ELEVATOR')) return 'elevator';

	return 'transit';
}

export function getMotisLegRouteLabel(leg: MotisPlanLeg) {
	const explicitLabel = leg.routeShortName;
	if (explicitLabel) return explicitLabel;

	const modeKind = getMotisLegModeKind(leg);
	if (modeKind === 'bus') return 'BUS';
	if (modeKind === 'bike') return 'BIKE';
	if (modeKind === 'car') return 'CAR';
	if (modeKind === 'subway') return 'METRO';
	if (modeKind === 'rail') return 'TRAIN';
	if (modeKind === 'tram') return 'TRAM';
	if (modeKind === 'ferry') return 'BARCO';
	if (modeKind === 'plane') return 'AVIÃO';
	if (modeKind === 'scooter') return 'TROTINETE';
	if (modeKind === 'elevator') return 'ELEVADOR';
	if (modeKind === 'walk') return 'WALK';

	return getMotisLegMode(leg);
}

export function getMotisLegTripIds(leg: MotisPlanLeg) {
	return typeof leg.tripId === 'string' && leg.tripId.length > 0 ? [leg.tripId] : [];
}

export function getMotisPlanPlaceStopId(place: MotisPlanPlace | undefined) {
	return place?.stopId || place?.stopCode;
}

export function getMotisLegTitle(leg: MotisPlanLeg) {
	const mode = leg.mode;
	const route = leg.routeShortName || '';
	const headsign = leg.headsign || '';

	return [mode, route, headsign].filter(Boolean).join(' ');
}

export function isMotisWalkingLeg(leg: MotisPlanLeg) {
	return getMotisLegModeKind(leg) === 'walk';
}

export function getMotisPlaceParam(location: RoutePlannerLocation) {
	if (location.type === 'STOP' && location.id) return location.id;

	if (Number.isFinite(location.lat) && Number.isFinite(location.lon)) {
		const level = Number.isFinite(location.level) ? `,${location.level}` : '';
		return `${location.lat},${location.lon}${level}`;
	}

	return location.label;
}

export function getMotisTransfersCount(value: number | undefined, legs: MotisPlanLeg[]) {
	if (Number.isFinite(value)) return value || 0;
	const transitLegs = legs.filter(leg => !['FOOT', 'WALK'].includes(leg.mode));
	return Math.max(0, transitLegs.length - 1);
}

export function mapMotisGeocodeResultToLocation(result: MotisGeocodeResult): RoutePlannerLocation {
	const label = result.name || formatCoordinateLabel(result.lat, result.lon) || 'Local sem nome';

	return {
		areas: result.areas,
		category: result.category,
		country: result.country,
		detail: formatMotisLocationDetail(result),
		houseNumber: result.houseNumber,
		id: result.id,
		label,
		lat: result.lat,
		level: result.level,
		lon: result.lon,
		modes: result.modes,
		street: result.street,
		type: result.type || 'PLACE',
		zip: result.zip,
	};
}

export function parseRoutePlannerCoordinate(value: string) {
	const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
	if (!match) return null;

	const lat = Number(match[1]);
	const lon = Number(match[2]);
	if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
		return null;
	}

	return { lat, lon };
}

export function routePlannerCoordinateToLocation(value: string): null | RoutePlannerLocation {
	const coordinate = parseRoutePlannerCoordinate(value);
	if (!coordinate) return null;

	const label = `${coordinate.lat},${coordinate.lon}`;

	return {
		detail: `Coordenadas | ${coordinate.lat.toFixed(5)}, ${coordinate.lon.toFixed(5)}`,
		label,
		lat: coordinate.lat,
		lon: coordinate.lon,
		type: 'PLACE',
	};
}

/* * */

function formatCoordinateLabel(lat: number | undefined, lon: number | undefined) {
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
	return `${lat},${lon}`;
}

function getMotisAreaNames(areas: MotisGeocodeArea[] | undefined, excludedValues: Array<string | undefined>) {
	const excluded = new Set(excludedValues.map(normalizeLocationPart).filter(Boolean));
	const result: string[] = [];
	const seen = new Set<string>();

	for (const area of areas ?? []) {
		const name = getUsefulLocationPart(area.name);
		const normalizedName = normalizeLocationPart(name);
		if (!name || !normalizedName || excluded.has(normalizedName) || seen.has(normalizedName)) continue;

		seen.add(normalizedName);
		result.push(name);
		if (result.length === 2) break;
	}

	return result;
}

function getUsefulLocationPart(value: string | undefined) {
	const normalizedValue = normalizeLocationPart(value);
	if (!normalizedValue || ['address', 'none', 'null', 'place', 'stop', 'undefined'].includes(normalizedValue)) return '';
	return value?.trim() ?? '';
}

function normalizeLocationPart(value: string | undefined) {
	return value?.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim() ?? '';
}

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
	const candidates: unknown[] = [
		leg.legGeometry,
	];

	for (const candidate of candidates) {
		const positions = getPositionsFromGeometryCandidate(candidate);
		if (positions.length >= 2) return positions;
	}

	return [];
}

function getMotisPlanPlacePosition(place: MotisPlanPlace | undefined): GeoJSON.Position | null {
	if (!place) return null;

	const directPosition = getPositionFromLatLon(
		place.lat,
		place.lon,
	);

	if (directPosition) return directPosition;

	return null;
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

function getSecondsBetween(start: string | undefined, end: string | undefined) {
	const startMs = Date.parse(start || '');
	const endMs = Date.parse(end || '');

	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return undefined;

	return Math.max(0, Math.round((endMs - startMs) / 1000));
}
