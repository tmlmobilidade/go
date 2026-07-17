/* * */

import { fetchMotisJson } from '@/endpoints/v1/motis/motis-client.js';
import { type MotisItinerary, type MotisPlanLeg, type MotisPlanResponse, type MotisQuery } from '@/endpoints/v1/motis/motis.types.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { apiCache } from '@tmlmobilidade/go-interfaces-api-cache';

/* * */

const MOTIS_GTFS_DATASET_TAG = process.env.MOTIS_GTFS_DATASET_TAG || 'GTFS';
const TRIP_PATTERNS_CACHE_KEY = 'hub:v1:network:trip-patterns';

/**
 * Plans a route through MOTIS and enriches every leg with its authoritative Hub pattern ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getPlan(request: FastifyRequest<{ Querystring: MotisQuery }>, reply: FastifyReply<MotisPlanResponse>) {
	const plan = await fetchMotisJson<MotisPlanResponse>('/api/v6/plan', request.query);
	const data = await enrichPlanWithPatternIds(plan);

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'no-store')
		.code(HTTP_STATUS.OK)
		.send({
			data,
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}

/* * */

async function enrichPlanWithPatternIds(plan: MotisPlanResponse): Promise<MotisPlanResponse> {
	const itineraries = [...plan.direct, ...plan.itineraries];
	const sourceTripIds = Array.from(new Set(
		itineraries.flatMap(itinerary => itinerary.legs.map(leg => getSourceTripId(leg.tripId)).filter((tripId): tripId is string => Boolean(tripId))),
	));
	const patternIdsByTripId = await apiCache.getHashFields(TRIP_PATTERNS_CACHE_KEY, sourceTripIds);

	return {
		...plan,
		direct: plan.direct.map(itinerary => enrichItinerary(itinerary, patternIdsByTripId)),
		itineraries: plan.itineraries.map(itinerary => enrichItinerary(itinerary, patternIdsByTripId)),
	};
}

function enrichItinerary(itinerary: MotisItinerary, patternIdsByTripId: Map<string, string>): MotisItinerary {
	return {
		...itinerary,
		legs: itinerary.legs.map(leg => enrichLeg(leg, patternIdsByTripId)),
	};
}

function enrichLeg(leg: MotisPlanLeg, patternIdsByTripId: Map<string, string>): MotisPlanLeg {
	const sourceTripId = getSourceTripId(leg.tripId);

	return {
		...leg,
		hubPatternId: sourceTripId ? patternIdsByTripId.get(sourceTripId) ?? null : null,
	};
}

function getSourceTripId(motisTripId: string | undefined): null | string {
	if (!motisTripId) return null;

	const datasetMarker = `_${MOTIS_GTFS_DATASET_TAG}_`;
	const datasetMarkerIndex = motisTripId.indexOf(datasetMarker);

	if (datasetMarkerIndex >= 0) return motisTripId.slice(datasetMarkerIndex + datasetMarker.length);
	if (motisTripId.startsWith(`${MOTIS_GTFS_DATASET_TAG}_`)) return motisTripId.slice(MOTIS_GTFS_DATASET_TAG.length + 1);

	return motisTripId;
}
