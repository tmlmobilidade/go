import { mapDefaultConfig } from '@/constants/map';
import { type BottomSheetNavigationEntry, type BottomSheetView } from '@/types/common/bottom-sheet';
import { type RoutePlannerLocation, type RoutePlannerLocationSearchTarget, type RoutePlannerTravelTimeMode, type RoutePlannerViewMode } from '@/types/route-planner/models';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';

/* * */

export interface PersistedMapCamera {
	bearing: number
	latitude: number
	longitude: number
	zoom: number
}

export interface PersistedRoute {
	destination: null | RoutePlannerLocation
	destinationUsesCurrentLocation: boolean
	locationSearchTarget: RoutePlannerLocationSearchTarget
	origin: null | RoutePlannerLocation
	originUsesCurrentLocation: boolean
	selectedItineraryIndex: null | number
	travelTime: { date: string, mode: RoutePlannerTravelTimeMode }
	viewMode: RoutePlannerViewMode
}

export interface PersistedAppSession {
	activeTrip: null | PersistedActiveTrip
	isMapFiltersOpen: boolean
	route: null | PersistedRoute
	sheets: BottomSheetNavigationEntry[]
	snapIndex: null | number
}

export interface PersistedActiveTrip {
	itinerary: MotisItinerary
	sheetHistory: BottomSheetNavigationEntry[]
}

/* * */

const CAMERA_KEY = 'navegante:map-camera:v1';
const SESSION_KEY = 'navegante:app-session:v1';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1_000;
const DETAIL_VIEWS = new Set<BottomSheetView>(['alerts-detail', 'lines-detail', 'stops-detail', 'vehicles-detail']);
const SIMPLE_VIEWS = new Set<BottomSheetView>(['routes', 'search']);
const ROUTE_VIEW_MODES = new Set<RoutePlannerViewMode>(['destination-search', 'itinerary-detail', 'place-detail', 'results']);
const TRAVEL_TIME_MODES = new Set<RoutePlannerTravelTimeMode>(['arrival', 'departure', 'now']);

/* * */

export function readPersistedMapCamera(): null | PersistedMapCamera {
	const value = readJson(CAMERA_KEY);
	if (!isRecord(value) || value.version !== 1 || !isRecord(value.camera)) return null;
	const { bearing, latitude, longitude, zoom } = value.camera;
	if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) return null;
	if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) return null;
	if (!isFiniteNumber(zoom) || zoom < mapDefaultConfig.minZoom || zoom > mapDefaultConfig.maxZoom) return null;
	if (!isFiniteNumber(bearing) || bearing < -360 || bearing > 360) return null;
	return { bearing, latitude, longitude, zoom };
}

export function writePersistedMapCamera(camera: PersistedMapCamera): void {
	writeJson(CAMERA_KEY, { camera, version: 1 });
}

export function readPersistedAppSession(): null | PersistedAppSession {
	const value = readJson(SESSION_KEY);
	if (!isRecord(value) || value.version !== 1 || !isFiniteNumber(value.savedAt)) return null;
	if (value.savedAt > Date.now() || Date.now() - value.savedAt > SESSION_MAX_AGE_MS) return null;
	if (!Array.isArray(value.sheets)) return null;

	const sheets = value.sheets.slice(-10).map(parseSheet).filter((entry): entry is BottomSheetNavigationEntry => entry !== null);
	const route = parseRoute(value.route);
	const activeTrip = route?.originUsesCurrentLocation && route.destination && route.viewMode === 'itinerary-detail' ? parseActiveTrip(value.activeTrip) : null;
	const validSheets = route ? sheets : sheets.filter(entry => entry.view !== 'routes');
	const snapIndex = Number.isInteger(value.snapIndex) && Number(value.snapIndex) > 0 ? Number(value.snapIndex) : null;
	return { activeTrip, isMapFiltersOpen: value.isMapFiltersOpen === true, route, sheets: validSheets, snapIndex };
}

export function writePersistedAppSession(session: PersistedAppSession): void {
	writeJson(SESSION_KEY, { ...session, savedAt: Date.now(), version: 1 });
}

export function toPersistedRouteLocation(location: null | RoutePlannerLocation): null | RoutePlannerLocation {
	if (!location || location.isCurrentLocation) return null;
	return parseLocation(location);
}

/* * */

function parseSheet(value: unknown): BottomSheetNavigationEntry | null {
	if (!isRecord(value) || typeof value.view !== 'string') return null;
	const view = value.view as BottomSheetView;
	if (DETAIL_VIEWS.has(view)) {
		return typeof value.entityId === 'string' && value.entityId.length > 0 && value.entityId.length <= 200
			? { entityId: value.entityId, view }
			: null;
	}
	return SIMPLE_VIEWS.has(view) ? { entityId: null, view } : null;
}

function parseRoute(value: unknown): null | PersistedRoute {
	if (!isRecord(value) || !isRecord(value.travelTime)) return null;
	if (!ROUTE_VIEW_MODES.has(value.viewMode as RoutePlannerViewMode)) return null;
	if (!TRAVEL_TIME_MODES.has(value.travelTime.mode as RoutePlannerTravelTimeMode)) return null;
	if (value.locationSearchTarget !== 'origin' && value.locationSearchTarget !== 'destination') return null;
	if (typeof value.travelTime.date !== 'string' || !Number.isFinite(Date.parse(value.travelTime.date))) return null;
	const origin = parseLocation(value.origin);
	const destination = parseLocation(value.destination);
	const selectedItineraryIndex = Number.isInteger(value.selectedItineraryIndex) && Number(value.selectedItineraryIndex) >= 0
		? Number(value.selectedItineraryIndex)
		: null;
	return {
		destination,
		destinationUsesCurrentLocation: value.destinationUsesCurrentLocation === true,
		locationSearchTarget: value.locationSearchTarget,
		origin,
		originUsesCurrentLocation: value.originUsesCurrentLocation === true,
		selectedItineraryIndex,
		travelTime: { date: value.travelTime.date, mode: value.travelTime.mode as RoutePlannerTravelTimeMode },
		viewMode: value.viewMode as RoutePlannerViewMode,
	};
}

function parseActiveTrip(value: unknown): null | PersistedActiveTrip {
	if (!isRecord(value) || !Array.isArray(value.sheetHistory)) return null;
	const itinerary = value.itinerary;
	if (!isRecord(itinerary) || typeof itinerary.id !== 'string' || !isFiniteNumber(itinerary.duration) || typeof itinerary.startTime !== 'string' || typeof itinerary.endTime !== 'string' || !Array.isArray(itinerary.legs) || itinerary.legs.length === 0) return null;
	if (!itinerary.legs.every(isPersistedTripLeg)) return null;
	return {
		itinerary: itinerary as MotisItinerary,
		sheetHistory: value.sheetHistory.slice(-10).map(parseSheet).filter((entry): entry is BottomSheetNavigationEntry => entry !== null),
	};
}

function isPersistedTripLeg(value: unknown): boolean {
	if (!isRecord(value) || !isFiniteNumber(value.duration) || typeof value.mode !== 'string') return false;
	if (typeof value.startTime !== 'string' || typeof value.endTime !== 'string') return false;
	if (!isRecord(value.from) || !isRecord(value.to) || !isRecord(value.legGeometry)) return false;
	if (typeof value.from.name !== 'string' || !isFiniteNumber(value.from.lat) || !isFiniteNumber(value.from.lon)) return false;
	if (typeof value.to.name !== 'string' || !isFiniteNumber(value.to.lat) || !isFiniteNumber(value.to.lon)) return false;
	return typeof value.legGeometry.points === 'string';
}

function parseLocation(value: unknown): null | RoutePlannerLocation {
	if (!isRecord(value) || typeof value.label !== 'string' || typeof value.detail !== 'string' || typeof value.type !== 'string') return null;
	if (value.label.length > 300 || value.detail.length > 500 || value.type.length > 100) return null;
	if (value.lat !== undefined && (!isFiniteNumber(value.lat) || value.lat < -90 || value.lat > 90)) return null;
	if (value.lon !== undefined && (!isFiniteNumber(value.lon) || value.lon < -180 || value.lon > 180)) return null;
	return {
		detail: value.detail,
		id: typeof value.id === 'string' ? value.id : undefined,
		label: value.label,
		lat: value.lat as number | undefined,
		lon: value.lon as number | undefined,
		type: value.type,
	};
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readJson(key: string): unknown {
	try {
		const value = window.localStorage.getItem(key);
		return value === null ? null : JSON.parse(value);
	} catch {
		return null;
	}
}

function writeJson(key: string, value: unknown): void {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// The webview may disable or exhaust storage; the app still works in memory.
	}
}
