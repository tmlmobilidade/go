import { getRoutePlannerLegRealtimeStatus, type RoutePlannerTimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { isMotisWalkingLeg } from '@/utils/route-planner/presentation/modes';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';

/* * */

export interface RoutePlannerWaitingStep {
	before_leg_index: number
	duration_seconds: number
	from_time: RoutePlannerTimeStatus
	to_time: RoutePlannerTimeStatus
}

/* * */

/** Count gaps before a transit leg as waiting; gaps before walking may include transfer time. */
export function getRoutePlannerWaitingSteps(itinerary: MotisItinerary): RoutePlannerWaitingStep[] {
	const { legs } = itinerary;
	return legs.flatMap((leg, index) => {
		const nextLeg = legs[index + 1];
		if (!nextLeg || isMotisWalkingLeg(nextLeg)) return [];

		const fromTime = getRoutePlannerLegRealtimeStatus(leg).to_time;
		const toTime = getRoutePlannerLegRealtimeStatus(nextLeg).from_time;
		const start = fromTime.effective_time ? Date.parse(fromTime.effective_time) : NaN;
		const end = toTime.effective_time ? Date.parse(toTime.effective_time) : NaN;
		const durationSeconds = (end - start) / 1_000;
		if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return [];

		return [{ before_leg_index: index + 1, duration_seconds: durationSeconds, from_time: fromTime, to_time: toTime }];
	});
}

export function getItineraryWaitingMinutes(itinerary: MotisItinerary) {
	const seconds = getRoutePlannerWaitingSteps(itinerary).reduce((total, step) => total + step.duration_seconds, 0);
	return seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
}
