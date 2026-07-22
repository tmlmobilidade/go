import { getMotisPlaceParam } from '@/utils/motis-geocode';
import { isMotisWalkingLeg } from '@/utils/route-planner-modes';
import { type MotisItinerary, type MotisPlanIntermediateStop, type MotisPlanLeg, type MotisPlanPlace, type MotisPlanResponse, type RoutePlannerLocation, type RoutePlannerTravelTime } from '@/utils/route-planner.types';
import { API_ROUTES } from '@tmlmobilidade/consts';

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

export async function fetchMotisPlan(origin: RoutePlannerLocation, destination: RoutePlannerLocation, travelTime: RoutePlannerTravelTime) {
	const params = buildMotisPlanParams(origin, destination, travelTime);
	const response = await fetch(`${API_ROUTES.hub.MOTIS_PLAN}?${params.toString()}`);

	if (!response.ok) throw new Error(`MOTIS returned HTTP ${response.status}`);

	const payload: { data: MotisPlanResponse } = await response.json();
	return payload.data;
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

export function getMotisLegDurationSeconds(leg: MotisPlanLeg) {
	if (Number.isFinite(leg.duration)) return leg.duration;
	return getSecondsBetween(leg.startTime, leg.endTime);
}

export function getMotisLegTripIds(leg: MotisPlanLeg) {
	return typeof leg.tripId === 'string' && leg.tripId.length > 0 ? [leg.tripId] : [];
}

export function getMotisPlanPlaceStopId(place: MotisPlanIntermediateStop | MotisPlanPlace | undefined) {
	return place?.stopId || place?.stopCode;
}

export function getMotisTransfersCount(value: number | undefined, legs: MotisPlanLeg[]) {
	if (Number.isFinite(value)) return value || 0;
	const transitLegs = legs.filter(leg => !['FOOT', 'WALK'].includes(leg.mode));
	return Math.max(0, transitLegs.length - 1);
}

/* * */

function getSecondsBetween(start: string | undefined, end: string | undefined) {
	const startMs = Date.parse(start || '');
	const endMs = Date.parse(end || '');

	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return undefined;

	return Math.max(0, Math.round((endMs - startMs) / 1000));
}
