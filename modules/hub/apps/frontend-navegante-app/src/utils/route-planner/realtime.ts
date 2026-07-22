import { type MotisPlanIntermediateStop, type MotisPlanLeg } from '@/types/route-planner';

/* * */

/**
 * App-facing representation of the effective and planned times returned by MOTIS.
 * MOTIS has already applied GTFS-RT before returning a realtime leg, so route-planner
 * components must not query or merge the raw trip-updates feed themselves.
 */
export interface RoutePlannerTimeStatus {
	effective_time: string | undefined
	is_realtime: boolean
	planned_time: string | undefined
}

export interface RoutePlannerLegRealtimeStatus {
	delay_seconds: number
	from_time: RoutePlannerTimeStatus
	to_time: RoutePlannerTimeStatus
}

export interface RoutePlannerItineraryRealtimeStatus {
	arrival_delay_seconds: number
	delay_seconds: number
	end_time: RoutePlannerTimeStatus | undefined
	is_realtime: boolean
	start_time: RoutePlannerTimeStatus | undefined
}

/* * */

export function getRoutePlannerLegRealtimeStatus(leg: MotisPlanLeg): RoutePlannerLegRealtimeStatus {
	const fromTime = buildTimeStatus(leg.startTime, leg.scheduledStartTime, leg.realTime);
	const toTime = buildTimeStatus(leg.endTime, leg.scheduledEndTime, leg.realTime);

	return {
		delay_seconds: getMostRelevantDelay([
			getTimeDelaySeconds(fromTime),
			getTimeDelaySeconds(toTime),
		]),
		from_time: fromTime,
		to_time: toTime,
	};
}

export function getRoutePlannerIntermediateStopRealtimeStatus(stop: MotisPlanIntermediateStop, isRealtime: boolean): RoutePlannerTimeStatus {
	const realtimeTime = stop.departure ?? stop.arrival;
	const plannedTime = stop.scheduledDeparture ?? stop.scheduledArrival;

	return buildTimeStatus(realtimeTime ?? plannedTime, plannedTime, isRealtime && !!realtimeTime);
}

export function getRoutePlannerItineraryRealtimeStatus(legs: MotisPlanLeg[]): RoutePlannerItineraryRealtimeStatus {
	const legStatuses = legs.map(getRoutePlannerLegRealtimeStatus);
	const isRealtime = legs.some(leg => leg.realTime);
	const endTime = legStatuses.at(-1)?.to_time;

	return {
		arrival_delay_seconds: isRealtime && endTime ? getTimeDifferenceSeconds(endTime) : 0,
		delay_seconds: getMostRelevantDelay(legStatuses.map(status => status.delay_seconds)),
		end_time: endTime,
		is_realtime: isRealtime,
		start_time: legStatuses[0]?.from_time,
	};
}

/* * */

function buildTimeStatus(effectiveTime: string | undefined, plannedTime: string | undefined, isRealtime: boolean): RoutePlannerTimeStatus {
	return {
		effective_time: effectiveTime,
		is_realtime: isRealtime,
		planned_time: plannedTime ?? effectiveTime,
	};
}

function getTimeDelaySeconds(time: RoutePlannerTimeStatus) {
	if (!time.is_realtime) return 0;
	return getTimeDifferenceSeconds(time);
}

function getTimeDifferenceSeconds(time: RoutePlannerTimeStatus) {
	const effectiveTimestamp = time.effective_time ? new Date(time.effective_time).getTime() : NaN;
	const plannedTimestamp = time.planned_time ? new Date(time.planned_time).getTime() : NaN;
	if (!Number.isFinite(effectiveTimestamp) || !Number.isFinite(plannedTimestamp)) return 0;

	return Math.round((effectiveTimestamp - plannedTimestamp) / 1000);
}

function getMostRelevantDelay(delays: number[]) {
	return delays.reduce((selectedDelay, delay) => {
		if (Math.abs(delay) <= Math.abs(selectedDelay)) return selectedDelay;
		return delay;
	}, 0);
}
