/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { cacheDb, hubV2PassengerDemandMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { type PassengerDemandMetrics, PassengerDemandMetricsSchema, type PassengerDemandMetricsSnapshot, PassengerDemandMetricsSnapshotSchema, type PassengerDemandSnapshotAgency, type PassengerDemandTrendPoint, type PassengerDemandValue } from '@tmlmobilidade/go-types-public-info';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const MAX_AGENCY_IDS = 100;
const TREND_BUCKET_INTERVALS = 1;

const intervalTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	hour: '2-digit',
	hour12: false,
	hourCycle: 'h23',
	minute: '2-digit',
	timeZone: 'Europe/Lisbon',
});

interface PassengerDemandQuery {
	agency_ids?: string | string[]
}

/* * */

function getIntervalIndex(intervalStart: number, intervalMinutes: number) {
	const parts = intervalTimeFormatter.formatToParts(new Date(intervalStart));
	const hour = Number(parts.find(part => part.type === 'hour')?.value);
	const minute = Number(parts.find(part => part.type === 'minute')?.value);
	const operationalHour = hour < 4 ? hour + 24 : hour;

	return Math.floor(((operationalHour - 4) * 60 + minute) / intervalMinutes);
}

function parseAgencyIds(value: PassengerDemandQuery['agency_ids']): string[] {
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

function quantile(values: number[], percentile: number) {
	if (values.length === 0) return null;

	const sorted = [...values].sort((left, right) => left - right);
	const index = (sorted.length - 1) * percentile;
	const lowerIndex = Math.floor(index);
	const upperIndex = Math.ceil(index);
	const lower = sorted[lowerIndex] ?? 0;
	const upper = sorted[upperIndex] ?? lower;

	return lower + (upper - lower) * (index - lowerIndex);
}

function getCommonComparableDates(agencies: PassengerDemandSnapshotAgency[]) {
	const firstAgency = agencies[0];
	if (!firstAgency) return [];

	const otherDateSets = agencies
		.slice(1)
		.map(agency => new Set(agency.comparable_days.map(day => day.operational_date)));

	return firstAgency.comparable_days
		.map(day => day.operational_date)
		.filter(operationalDate =>
			otherDateSets.every(dates => dates.has(operationalDate)),
		);
}

function sumPointsInBucket(
	agencies: PassengerDemandSnapshotAgency[],
	firstIntervalIndex: number,
	lastIntervalIndex: number,
) {
	return agencies.reduce((total, agency) =>
		total + agency.current_points.reduce((agencyTotal, point) =>
			point.interval_index >= firstIntervalIndex && point.interval_index <= lastIntervalIndex
				? agencyTotal + point.passenger_validations_qty
				: agencyTotal, 0), 0);
}

function sumComparablePointsInBucket(
	agencies: PassengerDemandSnapshotAgency[],
	operationalDate: number,
	firstIntervalIndex: number,
	lastIntervalIndex: number,
) {
	return agencies.reduce((total, agency) => {
		const day = agency.comparable_days.find(item =>
			item.operational_date === operationalDate,
		);
		return total + (day?.points.reduce((dayTotal, point) =>
			point.interval_index >= firstIntervalIndex && point.interval_index <= lastIntervalIndex
				? dayTotal + point.passenger_validations_qty
				: dayTotal, 0) ?? 0);
	}, 0);
}

function sumComparableUntilIndex(
	agencies: PassengerDemandSnapshotAgency[],
	operationalDate: number,
	intervalIndex: number,
) {
	return agencies.reduce((total, agency) => {
		const day = agency.comparable_days.find(item =>
			item.operational_date === operationalDate,
		);
		return total + (day?.points.reduce((dayTotal, point) =>
			point.interval_index <= intervalIndex
				? dayTotal + point.passenger_validations_qty
				: dayTotal, 0) ?? 0);
	}, 0);
}

function buildSelectedDemand(
	agencies: PassengerDemandSnapshotAgency[],
	snapshot: PassengerDemandMetricsSnapshot,
) {
	// Counts are additive across agencies, but percentiles are not. Build one
	// selected-set cumulative value per comparable date, then calculate its
	// reference distribution.
	const latestCompleteIndex = getIntervalIndex(
		snapshot.meta.current_cutoff,
		snapshot.meta.interval_minutes,
	);
	const comparableDates = getCommonComparableDates(agencies);
	const comparableCumulativeValues = comparableDates.map(operationalDate =>
		sumComparableUntilIndex(agencies, operationalDate, latestCompleteIndex),
	);
	const typicalCumulativeQty = quantile(comparableCumulativeValues, 0.5);
	const typicalLower = quantile(comparableCumulativeValues, 0.25);
	const typicalUpper = quantile(comparableCumulativeValues, 0.75);
	const nowQty = agencies.reduce((total, agency) =>
		total + agency.realtime.passenger_validations_qty_now, 0);
	const lastWeekQty = agencies.reduce((total, agency) =>
		total + agency.realtime.passenger_validations_qty_last_week, 0);

	let deviationStatus: PassengerDemandValue['deviation_status'] = 'unavailable';
	if (typicalLower !== null && typicalUpper !== null) {
		if (nowQty < typicalLower) deviationStatus = 'below_typical';
		else if (nowQty > typicalUpper) deviationStatus = 'above_typical';
		else deviationStatus = 'typical';
	}

	const value: PassengerDemandValue = {
		comparison_index_pct: lastWeekQty === 0 ? null : nowQty / lastWeekQty * 100,
		deviation_status: deviationStatus,
		passenger_validations_qty_last_week: lastWeekQty,
		passenger_validations_qty_now: nowQty,
		typical_comparison_index_pct: typicalCumulativeQty === null || typicalCumulativeQty === 0
			? null
			: nowQty / typicalCumulativeQty * 100,
		typical_cumulative_qty: typicalCumulativeQty,
		typical_range: typicalLower === null || typicalUpper === null
			? null
			: { lower: typicalLower, upper: typicalUpper },
	};
	const operationalDateStart = Dates.fromOperationalDate(
		validateOperationalDate(String(snapshot.meta.current_operational_date)),
		'Europe/Lisbon',
	);
	const trend: PassengerDemandTrendPoint[] = [];

	for (
		let intervalIndex = 0;
		intervalIndex <= latestCompleteIndex;
		intervalIndex += TREND_BUCKET_INTERVALS
	) {
		const lastBucketIntervalIndex = Math.min(
			latestCompleteIndex,
			intervalIndex + TREND_BUCKET_INTERVALS - 1,
		);
		const comparableValues = comparableDates.map(operationalDate =>
			sumComparablePointsInBucket(
				agencies,
				operationalDate,
				intervalIndex,
				lastBucketIntervalIndex,
			),
		);
		const median = quantile(comparableValues, 0.5);
		const lower = quantile(comparableValues, 0.25);
		const upper = quantile(comparableValues, 0.75);

		trend.push({
			interval_start: operationalDateStart
				.plus({ minutes: intervalIndex * snapshot.meta.interval_minutes })
				.unix_timestamp,
			passenger_validations_qty: sumPointsInBucket(
				agencies,
				intervalIndex,
				lastBucketIntervalIndex,
			),
			typical: median === null || lower === null || upper === null
				? null
				: { lower, median, upper },
		});
	}

	return {
		baselineOperationalDates: comparableDates,
		trend,
		value,
	};
}

/* * */

export function selectPassengerDemandMetrics(
	snapshot: PassengerDemandMetricsSnapshot,
	requestedAgencyIds: string[],
): PassengerDemandMetrics {
	const unavailableAgencyIds: string[] = [];
	const selectedAgencies: PassengerDemandSnapshotAgency[] = [];

	const agencies = requestedAgencyIds.map((agencyId) => {
		const agency = snapshot.agencies[agencyId];

		if (!agency) {
			unavailableAgencyIds.push(agencyId);
			return {
				agency_id: agencyId,
				availability: false,
				trend: [],
				value: null,
			};
		}

		selectedAgencies.push(agency);
		const selected = buildSelectedDemand([agency], snapshot);

		return {
			agency_id: agencyId,
			availability: true,
			trend: selected.trend,
			value: selected.value,
		};
	});

	const total = unavailableAgencyIds.length === 0
		? buildSelectedDemand(selectedAgencies, snapshot)
		: null;

	return PassengerDemandMetricsSchema.parse({
		agencies,
		definition_version: snapshot.definition_version,
		meta: {
			...snapshot.meta,
			baseline_operational_dates: total?.baselineOperationalDates ?? [],
			baseline_sample_size: total?.baselineOperationalDates.length ?? 0,
			requested_agency_ids: requestedAgencyIds,
			status: unavailableAgencyIds.length === 0 ? 'complete' : 'partial',
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: total?.trend ?? [],
			value: total?.value ?? null,
		},
	});
}

/* * */

export async function getPassengerDemand(
	request: FastifyRequest<{ Querystring: PassengerDemandQuery }>,
	reply: FastifyReply<PassengerDemandMetrics>,
) {
	const requestedAgencyIds = parseAgencyIds(request.query.agency_ids);
	const raw = await cacheDb.get(hubV2PassengerDemandMetricsCacheKey);

	if (!raw) {
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Passenger demand metrics are not available');
	}

	try {
		const snapshot = PassengerDemandMetricsSnapshotSchema.parse(JSON.parse(raw));
		const result = selectPassengerDemandMetrics(snapshot, requestedAgencyIds);

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
		Logger.error({ error, message: 'Invalid passenger demand metrics snapshot' });
		throw new HttpException(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Passenger demand metrics are invalid');
	}
}
