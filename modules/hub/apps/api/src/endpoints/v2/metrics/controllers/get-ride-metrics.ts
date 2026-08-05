/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { cacheDb, hubDepartureDelayMetricsCacheKey, hubServiceComplianceMetricsCacheKey, hubVkmExecutionMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { type DepartureDelayAgencyMetrics, type DepartureDelayMetrics, type ServiceComplianceAgencyMetrics, type ServiceComplianceMetrics, type VkmExecutionAgencyMetrics, type VkmExecutionMetrics } from '@tmlmobilidade/go-types-public-info';
import { DepartureDelayMetricsSchema, ServiceComplianceMetricsSchema, VkmExecutionMetricsSchema } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const MAX_AGENCY_IDS = 100;

interface RideMetricsQuery {
	agency_ids?: string | string[]
}

/* * */

function parseAgencyIds(value: RideMetricsQuery['agency_ids']): string[] {
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

function percentage(numerator: number, denominator: number) {
	return denominator === 0 ? null : Math.min(100, Math.max(0, numerator / denominator * 100));
}

function selectAgencies<T extends { agency_id: string, availability: boolean, trend: unknown[], value: null | object }>(
	agencies: T[],
	requestedAgencyIds: string[],
	empty: (agencyId: string) => T,
) {
	const unavailableAgencyIds: string[] = [];
	const selected = requestedAgencyIds.map((agencyId) => {
		const agency = agencies.find(item => item.agency_id === agencyId);
		if (agency?.availability) return agency;

		unavailableAgencyIds.push(agencyId);
		return empty(agencyId);
	});

	return { selected, unavailableAgencyIds };
}

/* * */

export function selectServiceComplianceMetrics(
	snapshot: ServiceComplianceMetrics,
	requestedAgencyIds: string[],
): ServiceComplianceMetrics {
	const { selected, unavailableAgencyIds } = selectAgencies<ServiceComplianceAgencyMetrics>(
		snapshot.agencies,
		requestedAgencyIds,
		agencyId => ({ agency_id: agencyId, availability: false, trend: [], value: null }),
	);
	const available = selected.filter(agency => agency.availability && agency.value !== null);
	const trendStarts = [...new Set(available.flatMap(agency => agency.trend.map(point => point.interval_start)))].sort((left, right) => left - right);
	const trend = trendStarts.map((intervalStart) => {
		const points = available.flatMap(agency => agency.trend.filter(point => point.interval_start === intervalStart));
		const executed = points.reduce((total, point) => total + point.executed_rides_qty, 0);
		const scheduled = points.reduce((total, point) => total + point.scheduled_rides_qty, 0);

		return {
			compliance_pct: percentage(executed, scheduled),
			executed_rides_qty: executed,
			interval_start: intervalStart,
			scheduled_rides_qty: scheduled,
		};
	});
	const executed = available.reduce((total, agency) => total + (agency.value?.executed_rides_qty ?? 0), 0);
	const noEvidence = available.reduce((total, agency) => total + (agency.value?.rides_without_execution_evidence_qty ?? 0), 0);
	const scheduled = available.reduce((total, agency) => total + (agency.value?.scheduled_rides_qty ?? 0), 0);
	const unexecuted = available.reduce((total, agency) => total + (agency.value?.unexecuted_rides_qty ?? 0), 0);
	const compliancePct = percentage(executed, scheduled);
	const isComplete = unavailableAgencyIds.length === 0;

	return ServiceComplianceMetricsSchema.parse({
		agencies: selected,
		definition_version: snapshot.definition_version,
		meta: {
			...snapshot.meta,
			requested_agency_ids: requestedAgencyIds,
			status: isComplete ? 'complete' : 'partial',
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: isComplete ? trend : [],
			value: isComplete ? {
				compliance_pct: compliancePct,
				compliance_status: compliancePct === null
					? 'unavailable'
					: compliancePct >= snapshot.meta.target_pct ? 'meets_target' : 'below_target',
				executed_rides_qty: executed,
				rides_without_execution_evidence_qty: noEvidence,
				scheduled_rides_qty: scheduled,
				unexecuted_rides_qty: unexecuted,
			} : null,
		},
	});
}

export function selectDepartureDelayMetrics(
	snapshot: DepartureDelayMetrics,
	requestedAgencyIds: string[],
): DepartureDelayMetrics {
	const { selected, unavailableAgencyIds } = selectAgencies<DepartureDelayAgencyMetrics>(
		snapshot.agencies,
		requestedAgencyIds,
		agencyId => ({ agency_id: agencyId, availability: false, trend: [], value: null }),
	);
	const available = selected.filter(agency => agency.availability && agency.value !== null);
	const trendStarts = [...new Set(available.flatMap(agency => agency.trend.map(point => point.interval_start)))].sort((left, right) => left - right);
	const trend = trendStarts.map((intervalStart) => {
		const points = available.flatMap(agency => agency.trend.filter(point => point.interval_start === intervalStart));
		const delay5To10 = points.reduce((total, point) => total + point.delay_5_to_10_minutes_rides_qty, 0);
		const delay10To20 = points.reduce((total, point) => total + point.delay_10_to_20_minutes_rides_qty, 0);
		const delayMoreThan20 = points.reduce((total, point) => total + point.delay_more_than_20_minutes_rides_qty, 0);
		const observed = points.reduce((total, point) => total + point.observed_rides_qty, 0);

		return {
			delay_10_to_20_minutes_rides_qty: delay10To20,
			delay_5_to_10_minutes_rides_qty: delay5To10,
			delay_more_than_20_minutes_rides_qty: delayMoreThan20,
			delayed_more_than_five_minutes_pct: percentage(delay5To10 + delay10To20 + delayMoreThan20, observed),
			interval_start: intervalStart,
			observed_rides_qty: observed,
		};
	});
	const observed = available.reduce((total, agency) => total + (agency.value?.observed_rides_qty ?? 0), 0);
	const eligible = available.reduce((total, agency) => total + (agency.value?.eligible_rides_qty ?? 0), 0);
	const delayed = available.reduce((total, agency) => total + (agency.value?.delayed_more_than_five_minutes_rides_qty ?? 0), 0);
	const delayMinutesSum = available.reduce((total, agency) =>
		total + (agency.value?.average_start_delay_minutes ?? 0) * (agency.value?.observed_rides_qty ?? 0), 0);
	const delayedPct = percentage(delayed, observed);
	const isComplete = unavailableAgencyIds.length === 0;

	return DepartureDelayMetricsSchema.parse({
		agencies: selected,
		definition_version: snapshot.definition_version,
		meta: {
			...snapshot.meta,
			requested_agency_ids: requestedAgencyIds,
			status: isComplete ? 'complete' : 'partial',
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: isComplete ? trend : [],
			value: isComplete ? {
				average_start_delay_minutes: observed === 0 ? null : delayMinutesSum / observed,
				coverage_pct: percentage(observed, eligible),
				delay_status: delayedPct === null
					? 'unavailable'
					: delayedPct > snapshot.meta.target_pct ? 'above_target' : 'within_target',
				delayed_more_than_five_minutes_pct: delayedPct,
				delayed_more_than_five_minutes_rides_qty: delayed,
				eligible_rides_qty: eligible,
				observed_rides_qty: observed,
			} : null,
		},
	});
}

export function selectVkmExecutionMetrics(
	snapshot: VkmExecutionMetrics,
	requestedAgencyIds: string[],
): VkmExecutionMetrics {
	const { selected, unavailableAgencyIds } = selectAgencies<VkmExecutionAgencyMetrics>(
		snapshot.agencies,
		requestedAgencyIds,
		agencyId => ({ agency_id: agencyId, availability: false, trend: [], value: null }),
	);
	const available = selected.filter(agency => agency.availability && agency.value !== null);
	const trendStarts = [...new Set(available.flatMap(agency => agency.trend.map(point => point.interval_start)))].sort((left, right) => left - right);
	const trend = trendStarts.map((intervalStart) => {
		const points = available.flatMap(agency => agency.trend.filter(point => point.interval_start === intervalStart));
		const executed = points.reduce((total, point) => total + point.executed_distance_km, 0);
		const scheduled = points.reduce((total, point) => total + point.scheduled_distance_km, 0);

		return {
			executed_distance_km: executed,
			execution_pct: percentage(executed, scheduled),
			interval_start: intervalStart,
			scheduled_distance_km: scheduled,
		};
	});
	const executed = available.reduce((total, agency) => total + (agency.value?.executed_distance_km ?? 0), 0);
	const scheduled = available.reduce((total, agency) => total + (agency.value?.scheduled_distance_km ?? 0), 0);
	const executionPct = percentage(executed, scheduled);
	const isComplete = unavailableAgencyIds.length === 0;

	return VkmExecutionMetricsSchema.parse({
		agencies: selected,
		definition_version: snapshot.definition_version,
		meta: {
			...snapshot.meta,
			requested_agency_ids: requestedAgencyIds,
			status: isComplete ? 'complete' : 'partial',
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: isComplete ? trend : [],
			value: isComplete ? {
				distance_to_plan_km: Math.max(0, scheduled - executed),
				executed_distance_km: executed,
				execution_pct: executionPct,
				execution_status: executionPct === null
					? 'unavailable'
					: executionPct >= snapshot.meta.target_pct ? 'within_target' : 'below_target',
				scheduled_distance_km: scheduled,
			} : null,
		},
	});
}

/* * */

async function readMetric<T>(cacheKey: Parameters<typeof cacheDb.get>[0], parse: (value: unknown) => T) {
	const raw = await cacheDb.get(cacheKey);
	if (!raw) throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Ride metrics are not available');

	return parse(JSON.parse(raw));
}

function sendMetric<T>(reply: FastifyReply<T>, metric: T) {
	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=15')
		.code(HTTP_STATUS.OK)
		.send({ data: metric, error: null, status_code: HTTP_STATUS.OK });
}

export async function getServiceCompliance(
	request: FastifyRequest<{ Querystring: RideMetricsQuery }>,
	reply: FastifyReply<ServiceComplianceMetrics>,
) {
	try {
		const agencyIds = parseAgencyIds(request.query.agency_ids);
		const snapshot = await readMetric(
			hubServiceComplianceMetricsCacheKey,
			value => ServiceComplianceMetricsSchema.parse(value),
		);
		return sendMetric(reply, selectServiceComplianceMetrics(snapshot, agencyIds));
	} catch (error) {
		if (error instanceof HttpException) throw error;
		Logger.error({ error, message: 'Invalid service compliance metrics snapshot' });
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Service compliance metrics are invalid');
	}
}

export async function getDepartureDelays(
	request: FastifyRequest<{ Querystring: RideMetricsQuery }>,
	reply: FastifyReply<DepartureDelayMetrics>,
) {
	try {
		const agencyIds = parseAgencyIds(request.query.agency_ids);
		const snapshot = await readMetric(
			hubDepartureDelayMetricsCacheKey,
			value => DepartureDelayMetricsSchema.parse(value),
		);
		return sendMetric(reply, selectDepartureDelayMetrics(snapshot, agencyIds));
	} catch (error) {
		if (error instanceof HttpException) throw error;
		Logger.error({ error, message: 'Invalid departure delay metrics snapshot' });
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Departure delay metrics are invalid');
	}
}

export async function getVkmExecution(
	request: FastifyRequest<{ Querystring: RideMetricsQuery }>,
	reply: FastifyReply<VkmExecutionMetrics>,
) {
	try {
		const agencyIds = parseAgencyIds(request.query.agency_ids);
		const snapshot = await readMetric(
			hubVkmExecutionMetricsCacheKey,
			value => VkmExecutionMetricsSchema.parse(value),
		);
		return sendMetric(reply, selectVkmExecutionMetrics(snapshot, agencyIds));
	} catch (error) {
		if (error instanceof HttpException) throw error;
		Logger.error({ error, message: 'Invalid VKM execution metrics snapshot' });
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'VKM execution metrics are invalid');
	}
}
