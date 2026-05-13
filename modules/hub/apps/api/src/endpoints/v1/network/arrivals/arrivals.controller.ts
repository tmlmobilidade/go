/* * */

import { readThroughHubJson } from '@/endpoints/v1/lib/hub-json-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { DATES, PCGIAPI } from '@tmlmobilidade/go-hub-pckg-services';
import { getOperationalDay } from '@tmlmobilidade/go-hub-pckg-utils';
import { DateTime } from 'luxon';

/* * */

interface RequestSchema {
	Params: {
		id: string
	}
}

const STOP_ID_PARAM_PATTERN = /^[\w.-]{1,128}$/;

/* * */

export class ArrivalsController {
	static async getArrivalsByPattern(request: FastifyRequest<RequestSchema>, reply: FastifyReply<unknown>) {
		const todayDateString = DateTime.now().setZone('Europe/Lisbon').toFormat('yyyyMMdd');
		const currentPlanIds = await getCurrentPlanIds();

		const patternId = request.params.id;
		const foundPatternTxt = await readThroughHubJson('hub:network:patterns:{patternId}', `hub/v1/network/arrivals:getArrivalsByPattern(${patternId})`, { patternId },
		);
		if (!foundPatternTxt) {
			return reply.status(404).send([]);
		}

		const foundPatternData = JSON.parse(foundPatternTxt);
		if (!foundPatternData) {
			return reply.status(404).send([]);
		}

		const activePatternsData = foundPatternData.filter(pattern => pattern.valid_on?.includes(todayDateString));
		if (!activePatternsData.length) {
			return reply
				.code(200)
				.header('cache-control', 'public, max-age=20')
				.send([]);
		}

		const stopIdsForThisPattern = activePatternsData.flatMap(item => item.path.map(waypoint => waypoint.stop_id)).join(',');
		const rows = await requestStopEtas(stopIdsForThisPattern);

		if (!rows.length) {
			return reply
				.code(200)
				.header('cache-control', 'public, max-age=20')
				.send([]);
		}

		const result = rows
			.filter(item => item.patternId === patternId)
			.map(item => ({
				estimated_arrival: item.stopArrivalEta || item.stopDepartureEta,
				estimated_arrival_unix: DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(item.stopArrivalEta) ?? DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(item.stopDepartureEta) ?? 0,
				headsign: item.tripHeadsign,
				line_id: item.lineId,
				observed_arrival: item.stopObservedArrivalTime || item.stopObservedDepartureTime,
				observed_arrival_unix: DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(item.stopObservedArrivalTime) ?? DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(item.stopObservedDepartureTime) ?? 0,
				pattern_id: item.patternId,
				route_id: item.routeId,
				scheduled_arrival: item.stopScheduledArrivalTime || item.stopScheduledDepartureTime,
				scheduled_arrival_unix: DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(item.stopScheduledArrivalTime) ?? DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(item.stopScheduledDepartureTime) ?? 0,
				stop_id: item.stopId,
				stop_sequence: item.stopSequence,
				trip_id: `[${currentPlanIds[item.agencyId] ?? ''}]${item.tripId}`,
				vehicle_id: item.observedVehicleId,
			}));

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=20')
			.send(result);
	}

	static async getArrivalsByStop(request: FastifyRequest<RequestSchema>, reply: FastifyReply<unknown>) {
		const stopParamId = request.params.id;
		if (!STOP_ID_PARAM_PATTERN.test(stopParamId)) {
			return reply.status(400).send([]);
		}

		const currentPlanIds = await getCurrentPlanIds();

		const rows = await requestStopEtas(stopParamId);

		if (!rows.length) {
			return reply
				.code(200)
				.header('cache-control', 'public, max-age=20')
				.send([]);
		}

		const result = rows.map((estimate) => {
			const compensatedEstimatedArrival = DATES.compensate24HourRegularStringInto24HourPlusOperationTimeString(estimate.stopArrivalEta) || DATES.compensate24HourRegularStringInto24HourPlusOperationTimeString(estimate.stopDepartureEta);
			return {
				estimated_arrival: compensatedEstimatedArrival,
				estimated_arrival_unix: DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(compensatedEstimatedArrival ?? undefined) ?? 0,
				headsign: estimate.tripHeadsign,
				line_id: estimate.lineId,
				observed_arrival: estimate.stopObservedArrivalTime || estimate.stopObservedDepartureTime,
				observed_arrival_unix: DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(estimate.stopObservedArrivalTime) ?? DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(estimate.stopObservedDepartureTime) ?? 0,
				pattern_id: estimate.patternId,
				route_id: estimate.routeId,
				scheduled_arrival: estimate.stopScheduledArrivalTime || estimate.stopScheduledDepartureTime,
				scheduled_arrival_unix: DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(estimate.stopScheduledArrivalTime) ?? DATES.convert24HourPlusOperationTimeStringToUnixTimestamp(estimate.stopScheduledDepartureTime) ?? 0,
				stop_id: stopParamId,
				stop_sequence: estimate.stopSequence,
				trip_id: `[${currentPlanIds[estimate.agencyId] ?? ''}]${estimate.tripId}`,
				vehicle_id: estimate.observedVehicleId,
			};
		});

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=20')
			.send(result);
	}
}

/* * */

interface PcgiStopEtaRow {
	agencyId: string
	lineId: string
	observedVehicleId?: null | string
	patternId: string
	routeId: string
	stopArrivalEta?: null | string
	stopDepartureEta?: null | string
	stopId: string
	stopObservedArrivalTime?: null | string
	stopObservedDepartureTime?: null | string
	stopScheduledArrivalTime?: null | string
	stopScheduledDepartureTime?: null | string
	stopSequence: number
	tripHeadsign: string
	tripId: string
}

/* * */

async function getCurrentPlanIds(): Promise<Record<string, string>> {
	const currentPlanIds: Record<string, string> = {};

	const allPlansTxt = await readThroughHubJson(
		'hub:network:plans:json',
		SERVERDB_KEYS.NETWORK.PLANS,
		'hub/v1/network/arrivals:getCurrentPlanIds()',
	);
	if (!allPlansTxt) return currentPlanIds;

	const allPlansData = JSON.parse(allPlansTxt);
	if (!allPlansData) return currentPlanIds;

	const todayOperationDate = normalizePlanDateString(getOperationalDay());

	for (const planData of allPlansData) {
		const start = normalizePlanDateString(planData.valid_range.start);
		const end = planData.valid_range.end ? normalizePlanDateString(planData.valid_range.end) : undefined;
		if (todayOperationDate < start) continue;
		if (end && todayOperationDate > end) continue;
		currentPlanIds[planData.agency_id] = planData.id;
	}

	return currentPlanIds;
}

/* * */

function normalizePlanDateString(value: string): string {
	return value.replaceAll('-', '');
}

/* * */

async function requestStopEtas(stopIdsPathSegment: string): Promise<PcgiStopEtaRow[]> {
	if (!process.env.PCGI_BASE_URL?.trim()) return [];
	try {
		const data = await PCGIAPI.request(`opcoreconsole/rt/stop-etas/${stopIdsPathSegment}`);
		return Array.isArray(data) ? data as PcgiStopEtaRow[] : [];
	} catch {
		return [];
	}
}
