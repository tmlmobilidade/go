/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { cacheDb, hubV2VideowallMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { type VideowallMetrics, VideowallMetricsSchema, type VideowallMetricsSnapshot, VideowallMetricsSnapshotSchema } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const MAX_AGENCY_IDS = 100;

interface VideowallQuery {
	agency_ids?: string | string[]
}

/* * */

function parseAgencyIds(value: VideowallQuery['agency_ids']): string[] {
	if (value === undefined) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'agency_ids is required');
	}

	const result = [...new Set(
		(Array.isArray(value) ? value : [value])
			.flatMap(item => item.split(','))
			.map(item => item.trim())
			.filter(Boolean),
	)];

	if (result.length === 0) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'agency_ids must contain at least one agency');
	}

	if (result.length > MAX_AGENCY_IDS) {
		throw new HttpException(
			HTTP_STATUS.BAD_REQUEST,
			`agency_ids cannot contain more than ${MAX_AGENCY_IDS} agencies`,
		);
	}

	return result;
}

export function selectVideowallMetrics(
	snapshot: VideowallMetricsSnapshot,
	requestedAgencyIds: string[],
): VideowallMetrics {
	const unavailableDemandAgencyIds: string[] = [];
	const unavailableServiceAgencyIds: string[] = [];
	let delayMinutesSum = 0;
	const total = {
		demand: {
			comparison_index_pct: null as null | number,
			passenger_validations_qty_last_week: 0,
			passenger_validations_qty_now: 0,
		},
		service: {
			delays: {
				average_start_delay_minutes: null as null | number,
				delayed_for_more_than_five_minutes_rides_qty: 0,
				start_delay_sample_qty: 0,
			},
			sla: {
				scheduled_rides_total_qty: 0,
				scheduled_rides_until_cutoff_qty: 0,
				simple_one_apex_validation_fail_rides_qty: 0,
				simple_three_vehicle_events_fail_rides_qty: 0,
				simple_three_vehicle_events_or_apex_validation_fail_rides_qty: 0,
			},
			vkm: {
				scheduled_distance_km: 0,
				simple_one_apex_validation_distance_km: 0,
				simple_three_vehicle_events_distance_km: 0,
				simple_three_vehicle_events_or_apex_validation_distance_km: 0,
			},
		},
	};

	const agencies = requestedAgencyIds.map((agencyId) => {
		const metrics = snapshot.agencies[agencyId];
		const demand = metrics?.demand ?? null;
		const service = metrics?.service ?? null;

		if (!demand) {
			unavailableDemandAgencyIds.push(agencyId);
		} else {
			total.demand.passenger_validations_qty_last_week += demand.passenger_validations_qty_last_week;
			total.demand.passenger_validations_qty_now += demand.passenger_validations_qty_now;
		}

		if (!service) {
			unavailableServiceAgencyIds.push(agencyId);
		} else {
			delayMinutesSum += (service.delays.average_start_delay_minutes ?? 0) * service.delays.start_delay_sample_qty;
			total.service.delays.delayed_for_more_than_five_minutes_rides_qty += service.delays.delayed_for_more_than_five_minutes_rides_qty;
			total.service.delays.start_delay_sample_qty += service.delays.start_delay_sample_qty;
			total.service.sla.scheduled_rides_total_qty += service.sla.scheduled_rides_total_qty;
			total.service.sla.scheduled_rides_until_cutoff_qty += service.sla.scheduled_rides_until_cutoff_qty;
			total.service.sla.simple_one_apex_validation_fail_rides_qty += service.sla.simple_one_apex_validation_fail_rides_qty;
			total.service.sla.simple_three_vehicle_events_fail_rides_qty += service.sla.simple_three_vehicle_events_fail_rides_qty;
			total.service.sla.simple_three_vehicle_events_or_apex_validation_fail_rides_qty += service.sla.simple_three_vehicle_events_or_apex_validation_fail_rides_qty;
			total.service.vkm.scheduled_distance_km += service.vkm.scheduled_distance_km;
			total.service.vkm.simple_one_apex_validation_distance_km += service.vkm.simple_one_apex_validation_distance_km;
			total.service.vkm.simple_three_vehicle_events_distance_km += service.vkm.simple_three_vehicle_events_distance_km;
			total.service.vkm.simple_three_vehicle_events_or_apex_validation_distance_km += service.vkm.simple_three_vehicle_events_or_apex_validation_distance_km;
		}

		return {
			agency_id: agencyId,
			availability: {
				demand: Boolean(demand),
				service: Boolean(service),
			},
			demand,
			service,
		};
	});

	if (total.demand.passenger_validations_qty_last_week > 0) {
		total.demand.comparison_index_pct = total.demand.passenger_validations_qty_now / total.demand.passenger_validations_qty_last_week * 100;
	}

	if (total.service.delays.start_delay_sample_qty > 0) {
		total.service.delays.average_start_delay_minutes = delayMinutesSum / total.service.delays.start_delay_sample_qty;
	}

	const isComplete = snapshot.meta.sources_aligned && unavailableDemandAgencyIds.length === 0 && unavailableServiceAgencyIds.length === 0;

	return VideowallMetricsSchema.parse({
		agencies,
		definition_version: snapshot.definition_version,
		meta: {
			...snapshot.meta,
			requested_agency_ids: requestedAgencyIds,
			status: isComplete ? 'complete' : 'partial',
			unavailable_demand_agency_ids: unavailableDemandAgencyIds,
			unavailable_service_agency_ids: unavailableServiceAgencyIds,
		},
		total: {
			demand: unavailableDemandAgencyIds.length === 0 ? total.demand : null,
			service: unavailableServiceAgencyIds.length === 0 ? total.service : null,
		},
	});
}

/* * */

export async function getVideowall(
	request: FastifyRequest<{ Querystring: VideowallQuery }>,
	reply: FastifyReply<VideowallMetrics>,
) {
	const requestedAgencyIds = parseAgencyIds(request.query.agency_ids);
	const raw = await cacheDb.get(hubV2VideowallMetricsCacheKey);

	if (!raw) {
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Videowall metrics are not available');
	}

	try {
		const snapshot = VideowallMetricsSnapshotSchema.parse(JSON.parse(raw));
		const result = selectVideowallMetrics(snapshot, requestedAgencyIds);

		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=15')
			.code(HTTP_STATUS.OK)
			.send({
				data: result,
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	} catch (error) {
		Logger.error({ error, message: 'Invalid Videowall v2 metrics snapshot' });
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Videowall metrics are invalid');
	}
}
