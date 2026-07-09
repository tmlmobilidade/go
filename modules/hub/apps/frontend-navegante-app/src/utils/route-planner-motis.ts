/* * */

export type RoutePlannerTravelTimeMode = 'arrival' | 'departure' | 'now';

/* * */

export interface MotisGeocodeArea {
	name?: string
}

export interface MotisGeocodeResult {
	areas?: MotisGeocodeArea[]
	id?: string
	lat?: number
	level?: number
	lon?: number
	modes?: string[]
	name?: string
	street?: string
	type?: string
}

export interface RoutePlannerLocation {
	areas?: MotisGeocodeArea[]
	detail: string
	id?: string
	label: string
	lat?: number
	level?: number
	lon?: number
	modes?: string[]
	street?: string
	type: string
}

export interface MotisPlanLeg {
	arrivalTime?: string
	departureTime?: string
	direction?: string
	duration?: number
	endTime?: string
	from?: {
		name?: string
		stop?: {
			name?: string
		}
	}
	headsign?: string
	line?: string
	mode?: string
	route?: string
	routeShortName?: string
	startTime?: string
	to?: {
		name?: string
		stop?: {
			name?: string
		}
	}
	transportMode?: string
}

export interface MotisItinerary {
	arrivalTime?: string
	departureTime?: string
	duration?: number
	end?: string
	endTime?: string
	legs?: MotisPlanLeg[]
	start?: string
	startTime?: string
	transfers?: number
}

export interface MotisPlanResponse {
	connections?: MotisItinerary[]
	itineraries?: MotisItinerary[]
}

export interface RoutePlannerTravelTime {
	date: Date
	mode: RoutePlannerTravelTimeMode
}

/* * */

export function buildMotisProxyUrl(path: string, params?: URLSearchParams) {
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
	const query = params ? `?${params.toString()}` : '';
	return `${basePath}/api/motis${path}${query}`;
}

export function buildMotisPlanParams(origin: RoutePlannerLocation, destination: RoutePlannerLocation, travelTime: RoutePlannerTravelTime) {
	const requestDate = travelTime.mode === 'now' ? new Date() : travelTime.date;

	const params = new URLSearchParams({
		detailedLegs: 'true',
		directModes: 'WALK',
		fromPlace: getMotisPlaceParam(origin),
		maxItineraries: '5',
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

export function formatMotisLocationDetail(location: MotisGeocodeResult | RoutePlannerLocation) {
	const parts = [
		location.type,
		Array.isArray(location.modes) && location.modes.length > 0 ? location.modes.join(', ') : '',
		location.street,
		Array.isArray(location.areas) ? location.areas.map(area => area.name).filter(Boolean).slice(0, 2).join(', ') : '',
		Number.isFinite(location.lat) && Number.isFinite(location.lon) ? `${location.lat?.toFixed(5)}, ${location.lon?.toFixed(5)}` : '',
	];

	return parts.filter(Boolean).join(' | ');
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
	if (Array.isArray(plan.connections)) return plan.connections;
	return [];
}

export function getMotisItineraryEnd(itinerary: MotisItinerary) {
	return itinerary.endTime || itinerary.arrivalTime || itinerary.end;
}

export function getMotisItineraryStart(itinerary: MotisItinerary) {
	return itinerary.startTime || itinerary.departureTime || itinerary.start;
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
	const from = leg.from?.name || leg.from?.stop?.name || fallbackOrigin;
	const to = leg.to?.name || leg.to?.stop?.name || fallbackDestination;
	const start = formatMotisPlanTime(leg.startTime || leg.departureTime);
	const end = formatMotisPlanTime(leg.endTime || leg.arrivalTime);

	return `${start} -> ${end} | ${from} -> ${to}`;
}

export function getMotisLegDurationSeconds(leg: MotisPlanLeg) {
	if (Number.isFinite(leg.duration)) return leg.duration;
	return getSecondsBetween(leg.startTime || leg.departureTime, leg.endTime || leg.arrivalTime);
}

export function getMotisLegMode(leg: MotisPlanLeg) {
	return (leg.mode || leg.transportMode || 'LEG').toUpperCase();
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
	const explicitLabel = leg.routeShortName || leg.route || leg.line;
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

export function getMotisLegTitle(leg: MotisPlanLeg) {
	const mode = leg.mode || leg.transportMode || 'LEG';
	const route = leg.routeShortName || leg.route || leg.line || '';
	const headsign = leg.headsign || leg.direction || '';

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
	const transitLegs = legs.filter(leg => !['FOOT', 'WALK'].includes(leg.mode || ''));
	return Math.max(0, transitLegs.length - 1);
}

export function mapMotisGeocodeResultToLocation(result: MotisGeocodeResult): RoutePlannerLocation {
	const label = result.name || formatCoordinateLabel(result.lat, result.lon) || 'Local sem nome';

	return {
		areas: result.areas,
		detail: formatMotisLocationDetail(result),
		id: result.id,
		label,
		lat: result.lat,
		level: result.level,
		lon: result.lon,
		modes: result.modes,
		street: result.street,
		type: result.type || 'PLACE',
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

function getSecondsBetween(start: string | undefined, end: string | undefined) {
	const startMs = Date.parse(start || '');
	const endMs = Date.parse(end || '');

	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return undefined;

	return Math.max(0, Math.round((endMs - startMs) / 1000));
}
