/* * */

import {
	type DepartureDelayMetrics,
	DepartureDelayMetricsSchema,
	type DepartureDelayTrendPoint,
	DepartureDelayTrendPointSchema,
	type DepartureDelayValue,
	type PassengerDemandMetrics,
	PassengerDemandMetricsSchema,
	type PassengerDemandValue,
	type ServiceComplianceMetrics,
	ServiceComplianceMetricsSchema,
	type ServiceComplianceTrendPoint,
	ServiceComplianceTrendPointSchema,
	type ServiceComplianceValue,
	type VkmExecutionMetrics,
	VkmExecutionMetricsSchema,
	type VkmExecutionTrendPoint,
	VkmExecutionTrendPointSchema,
	type VkmExecutionValue,
} from '@tmlmobilidade/go-types-public-info';

import { type VideowallMockScenario } from './config';
import { getDemandDeviationStatus, VIDEOWALL_SCENARIOS } from './scenarios';

/* * */

const AGENCY_WEIGHTS: Record<string, number> = {
	A2L1N: 0.22,
	BNA17: 0.25,
	IA9T6: 1,
	LA77N: 0.28,
	YA15B: 0.25,
};
const BASELINE_DATE_OFFSETS = [7, 14, 21, 28, 35, 42, 49, 56];
const DEPARTURE_DELAY_INTERVAL_MINUTES = 60;
const DEPARTURE_DELAY_TARGET_PCT = 10;
const DEPARTURE_DELAY_TREND_OBSERVED_RIDES = [
	1_850,
	1_920,
	2_050,
	2_180,
	2_100,
	1_980,
	1_900,
	1_880,
	1_940,
	2_020,
	2_100,
	1_980,
	1_743,
];
const FIFTEEN_MINUTES = 15 * 60 * 1_000;
const SERVICE_COMPLIANCE_INTERVAL_MINUTES = 120;
const SERVICE_COMPLIANCE_TARGET_PCT = 95;
const SERVICE_COMPLIANCE_TREND_SCHEDULE = [560, 540, 545, 555, 548, 550, 530];
const TREND_POINT_COUNT = 49;
const VKM_EXECUTION_INTERVAL_MINUTES = 120;
const VKM_EXECUTION_TARGET_PCT = 95;
const VKM_EXECUTION_TREND_SCHEDULE = [22_000, 25_000, 29_000, 30_000, 31_000, 30_000, 27_446];

export interface VideowallMockMetrics {
	demand_metrics: PassengerDemandMetrics
	departure_delay_metrics: DepartureDelayMetrics
	service_compliance_metrics: ServiceComplianceMetrics
	vkm_execution_metrics: VkmExecutionMetrics
}

/* * */

function getOperationalDateInt(value: Date) {
	return value.getFullYear() * 10_000 + (value.getMonth() + 1) * 100 + value.getDate();
}

function getOperationalDateStart() {
	const start = new Date();
	start.setHours(4, 0, 0, 0);

	if (Date.now() < start.getTime()) {
		start.setDate(start.getDate() - 1);
	}

	return start;
}

function getAgencyWeights(agencyIds: readonly string[]) {
	const rawWeights = agencyIds.map(agencyId => AGENCY_WEIGHTS[agencyId] ?? 1);
	const totalWeight = rawWeights.reduce((total, weight) => total + weight, 0);

	return Object.fromEntries(
		agencyIds.map((agencyId, index) => [agencyId, (rawWeights[index] ?? 0) / totalWeight]),
	);
}

function scaleInteger(value: number, weight: number) {
	return Math.round(value * weight);
}

function scaleMeasure(value: number, weight: number) {
	return Math.round(value * weight * 100) / 100;
}

function createTrend(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	startTimestamp: number,
	weight = 1,
) {
	const definition = VIDEOWALL_SCENARIOS[scenario];

	return Array.from({ length: TREND_POINT_COUNT }, (_, index) => {
		const progress = index / (TREND_POINT_COUNT - 1);
		const morningPeak = Math.exp(-Math.pow((progress - 0.28) / 0.13, 2)) * 1_750;
		const afternoonLevel = Math.exp(-Math.pow((progress - 0.70) / 0.32, 2)) * 650;
		const median = (280 + morningPeak + afternoonLevel) * weight;
		const wave = Math.sin(index * 1.7) * 0.035;
		const badDayDip = scenario === 'bad' && index > 29 && index < 38 ? -0.22 : 0;
		const current = median * (definition.demand.trend_factor + wave + badDayDip);

		return {
			interval_start: startTimestamp + index * FIFTEEN_MINUTES,
			passenger_validations_qty: Math.max(0, Math.round(current)),
			typical: {
				lower: Math.round(median * 0.90 * 100) / 100,
				median: Math.round(median * 100) / 100,
				upper: Math.round(median * 1.10 * 100) / 100,
			},
		};
	});
}

function createDemandValue(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	weight = 1,
): PassengerDemandValue {
	const definition = VIDEOWALL_SCENARIOS[scenario].demand;
	const currentQty = scaleInteger(definition.current_qty, weight);
	const lastWeekQty = scaleInteger(
		definition.reference_median_qty * definition.last_week_factor,
		weight,
	);
	const referenceMedian = scaleMeasure(definition.reference_median_qty, weight);
	const referenceLower = scaleMeasure(definition.reference_lower_qty, weight);
	const referenceUpper = scaleMeasure(definition.reference_upper_qty, weight);

	return {
		comparison_index_pct: lastWeekQty === 0 ? null : currentQty / lastWeekQty * 100,
		deviation_status: getDemandDeviationStatus(currentQty, referenceLower, referenceUpper),
		passenger_validations_qty_last_week: lastWeekQty,
		passenger_validations_qty_now: currentQty,
		typical_comparison_index_pct: referenceMedian === 0 ? null : currentQty / referenceMedian * 100,
		typical_cumulative_qty: referenceMedian,
		typical_range: {
			lower: referenceLower,
			upper: referenceUpper,
		},
	};
}

function createServiceComplianceTrend(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	startTimestamp: number,
	weight = 1,
): ServiceComplianceTrendPoint[] {
	const definition = VIDEOWALL_SCENARIOS[scenario].service;

	return SERVICE_COMPLIANCE_TREND_SCHEDULE.map((scheduledRides, index) => {
		const scheduledRidesQty = scaleInteger(scheduledRides, weight);
		const intervalVariation = Math.sin(index * 1.35) * 0.008;
		const executionRatio = Math.min(1, Math.max(
			0,
			1 - definition.failure_ratio + intervalVariation,
		));
		const executedRidesQty = Math.round(scheduledRidesQty * executionRatio);

		return ServiceComplianceTrendPointSchema.parse({
			compliance_pct: scheduledRidesQty === 0
				? null
				: executedRidesQty / scheduledRidesQty * 100,
			executed_rides_qty: executedRidesQty,
			interval_start: startTimestamp + index * SERVICE_COMPLIANCE_INTERVAL_MINUTES * 60_000,
			scheduled_rides_qty: scheduledRidesQty,
		});
	});
}

function createServiceComplianceValue(
	trend: ServiceComplianceTrendPoint[],
): ServiceComplianceValue {
	const scheduledRidesQty = trend.reduce(
		(total, point) => total + point.scheduled_rides_qty,
		0,
	);
	const executedRidesQty = trend.reduce(
		(total, point) => total + point.executed_rides_qty,
		0,
	);
	const unexecutedRidesQty = Math.max(0, scheduledRidesQty - executedRidesQty);
	const compliancePct = scheduledRidesQty === 0
		? null
		: executedRidesQty / scheduledRidesQty * 100;

	return {
		compliance_pct: compliancePct,
		compliance_status: compliancePct === null
			? 'unavailable'
			: compliancePct >= SERVICE_COMPLIANCE_TARGET_PCT
				? 'meets_target'
				: 'below_target',
		executed_rides_qty: executedRidesQty,
		rides_without_execution_evidence_qty: Math.round(unexecutedRidesQty * 0.24),
		scheduled_rides_qty: scheduledRidesQty,
		unexecuted_rides_qty: unexecutedRidesQty,
	};
}

function getDepartureDelayCoverageRatio(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
) {
	if (scenario === 'excellent') return 0.994;
	if (scenario === 'bad') return 0.955;
	return 0.982;
}

function getDepartureDelaySeverityRatios(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
) {
	if (scenario === 'excellent') return [0.84, 0.13, 0.03] as const;
	if (scenario === 'bad') return [0.54, 0.30, 0.16] as const;
	return [0.72, 0.21, 0.07] as const;
}

function createDepartureDelayTrend(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	startTimestamp: number,
	weight = 1,
): DepartureDelayTrendPoint[] {
	const definition = VIDEOWALL_SCENARIOS[scenario].service;
	const severityRatios = getDepartureDelaySeverityRatios(scenario);

	return DEPARTURE_DELAY_TREND_OBSERVED_RIDES.map((observedRides, index) => {
		const observedRidesQty = scaleInteger(observedRides, weight);
		const intervalVariation = Math.sin(index * 1.15) * 0.006;
		const delayedRatio = Math.min(1, Math.max(
			0,
			definition.delayed_ratio + intervalVariation,
		));
		const delayedRidesQty = Math.round(observedRidesQty * delayedRatio);
		const delay5To10Qty = Math.round(delayedRidesQty * severityRatios[0]);
		const delay10To20Qty = Math.round(delayedRidesQty * severityRatios[1]);
		const delayMoreThan20Qty = Math.max(
			0,
			delayedRidesQty - delay5To10Qty - delay10To20Qty,
		);

		return DepartureDelayTrendPointSchema.parse({
			delay_10_to_20_minutes_rides_qty: delay10To20Qty,
			delay_5_to_10_minutes_rides_qty: delay5To10Qty,
			delay_more_than_20_minutes_rides_qty: delayMoreThan20Qty,
			delayed_more_than_five_minutes_pct: observedRidesQty === 0
				? null
				: delayedRidesQty / observedRidesQty * 100,
			interval_start: startTimestamp + index * DEPARTURE_DELAY_INTERVAL_MINUTES * 60_000,
			observed_rides_qty: observedRidesQty,
		});
	});
}

function createDepartureDelayValue(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	trend: DepartureDelayTrendPoint[],
): DepartureDelayValue {
	const observedRidesQty = trend.reduce(
		(total, point) => total + point.observed_rides_qty,
		0,
	);
	const delayedRidesQty = trend.reduce((total, point) => {
		const pointDelayedRidesQty = [
			point.delay_5_to_10_minutes_rides_qty,
			point.delay_10_to_20_minutes_rides_qty,
			point.delay_more_than_20_minutes_rides_qty,
		].reduce((subtotal, quantity) => subtotal + quantity, 0);

		return total + pointDelayedRidesQty;
	}, 0);
	const coverageRatio = getDepartureDelayCoverageRatio(scenario);
	const eligibleRidesQty = Math.round(observedRidesQty / coverageRatio);
	const delayedRidesPct = observedRidesQty === 0
		? null
		: delayedRidesQty / observedRidesQty * 100;

	return {
		average_start_delay_minutes: VIDEOWALL_SCENARIOS[scenario].service.average_delay_minutes,
		coverage_pct: eligibleRidesQty === 0
			? null
			: observedRidesQty / eligibleRidesQty * 100,
		delay_status: delayedRidesPct === null
			? 'unavailable'
			: delayedRidesPct > DEPARTURE_DELAY_TARGET_PCT
				? 'above_target'
				: 'within_target',
		delayed_more_than_five_minutes_pct: delayedRidesPct,
		delayed_more_than_five_minutes_rides_qty: delayedRidesQty,
		eligible_rides_qty: eligibleRidesQty,
		observed_rides_qty: observedRidesQty,
	};
}

function createVkmExecutionTrend(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	startTimestamp: number,
	weight = 1,
): VkmExecutionTrendPoint[] {
	const deliveryRatio = VIDEOWALL_SCENARIOS[scenario].service.distance_delivery_ratio;

	return VKM_EXECUTION_TREND_SCHEDULE.map((scheduledDistance, index) => {
		const scheduledDistanceKm = scaleInteger(scheduledDistance, weight);
		const intervalVariation = Math.sin(index * 1.05) * 0.004;
		const executionRatio = Math.min(1, Math.max(0, deliveryRatio + intervalVariation));
		const executedDistanceKm = Math.round(scheduledDistanceKm * executionRatio * 100) / 100;

		return VkmExecutionTrendPointSchema.parse({
			executed_distance_km: executedDistanceKm,
			execution_pct: scheduledDistanceKm === 0
				? null
				: executedDistanceKm / scheduledDistanceKm * 100,
			interval_start: startTimestamp + index * VKM_EXECUTION_INTERVAL_MINUTES * 60_000,
			scheduled_distance_km: scheduledDistanceKm,
		});
	});
}

function createVkmExecutionValue(
	trend: VkmExecutionTrendPoint[],
): VkmExecutionValue {
	const scheduledDistanceKm = trend.reduce(
		(total, point) => total + point.scheduled_distance_km,
		0,
	);
	const executedDistanceKm = trend.reduce(
		(total, point) => total + point.executed_distance_km,
		0,
	);
	const executionPct = scheduledDistanceKm === 0
		? null
		: executedDistanceKm / scheduledDistanceKm * 100;

	return {
		distance_to_plan_km: Math.max(0, scheduledDistanceKm - executedDistanceKm),
		executed_distance_km: executedDistanceKm,
		execution_pct: executionPct,
		execution_status: executionPct === null
			? 'unavailable'
			: executionPct >= VKM_EXECUTION_TARGET_PCT
				? 'within_target'
				: 'below_target',
		scheduled_distance_km: scheduledDistanceKm,
	};
}

/* * */

export function createVideowallMockMetrics(
	agencyIds: readonly string[],
	scenario: VideowallMockScenario,
): VideowallMockMetrics {
	const operationalDateStart = getOperationalDateStart();
	const operationalDateStartTimestamp = operationalDateStart.getTime();
	const currentOperationalDate = getOperationalDateInt(operationalDateStart);
	const latestCompleteInterval = operationalDateStartTimestamp + (TREND_POINT_COUNT - 1) * FIFTEEN_MINUTES;
	const currentCutoff = latestCompleteInterval + 60_000 - 1;
	const generatedAt = currentCutoff + 5_000;
	const lastWeekCutoffDate = new Date(currentCutoff);
	lastWeekCutoffDate.setDate(lastWeekCutoffDate.getDate() - 7);
	const lastWeekCutoff = lastWeekCutoffDate.getTime();
	const weights = getAgencyWeights(agencyIds);
	const isAvailable = VIDEOWALL_SCENARIOS[scenario].availability;
	const readyScenario = scenario === 'unavailable' ? 'regular' : scenario;
	const baselineOperationalDates = BASELINE_DATE_OFFSETS.map((offset) => {
		const date = new Date(operationalDateStart);
		date.setDate(date.getDate() - offset);
		return getOperationalDateInt(date);
	});
	const totalDemandValue = isAvailable ? createDemandValue(readyScenario) : null;
	const totalTrend = isAvailable
		? createTrend(readyScenario, operationalDateStartTimestamp)
		: [];
	const totalServiceComplianceTrend = isAvailable
		? createServiceComplianceTrend(readyScenario, operationalDateStartTimestamp)
		: [];
	const totalServiceComplianceValue = isAvailable
		? createServiceComplianceValue(totalServiceComplianceTrend)
		: null;
	const totalDepartureDelayTrend = isAvailable
		? createDepartureDelayTrend(readyScenario, operationalDateStartTimestamp)
		: [];
	const totalDepartureDelayValue = isAvailable
		? createDepartureDelayValue(readyScenario, totalDepartureDelayTrend)
		: null;
	const totalVkmExecutionTrend = isAvailable
		? createVkmExecutionTrend(readyScenario, operationalDateStartTimestamp)
		: [];
	const totalVkmExecutionValue = isAvailable
		? createVkmExecutionValue(totalVkmExecutionTrend)
		: null;

	const demandAgencies = agencyIds.map((agencyId) => {
		const weight = weights[agencyId] ?? 0;
		return {
			agency_id: agencyId,
			availability: isAvailable,
			trend: isAvailable ? createTrend(readyScenario, operationalDateStartTimestamp, weight) : [],
			value: isAvailable ? createDemandValue(readyScenario, weight) : null,
		};
	});
	const serviceComplianceAgencies = agencyIds.map((agencyId) => {
		const trend = isAvailable
			? createServiceComplianceTrend(
				readyScenario,
				operationalDateStartTimestamp,
				weights[agencyId] ?? 0,
			)
			: [];

		return {
			agency_id: agencyId,
			availability: isAvailable,
			trend,
			value: isAvailable ? createServiceComplianceValue(trend) : null,
		};
	});
	const departureDelayAgencies = agencyIds.map((agencyId) => {
		const trend = isAvailable
			? createDepartureDelayTrend(
				readyScenario,
				operationalDateStartTimestamp,
				weights[agencyId] ?? 0,
			)
			: [];

		return {
			agency_id: agencyId,
			availability: isAvailable,
			trend,
			value: isAvailable ? createDepartureDelayValue(readyScenario, trend) : null,
		};
	});
	const vkmExecutionAgencies = agencyIds.map((agencyId) => {
		const trend = isAvailable
			? createVkmExecutionTrend(
				readyScenario,
				operationalDateStartTimestamp,
				weights[agencyId] ?? 0,
			)
			: [];

		return {
			agency_id: agencyId,
			availability: isAvailable,
			trend,
			value: isAvailable ? createVkmExecutionValue(trend) : null,
		};
	});
	const unavailableAgencyIds = isAvailable ? [] : [...agencyIds];
	const demandMetrics = PassengerDemandMetricsSchema.parse({
		agencies: demandAgencies,
		definition_version: 'passenger-demand-v2',
		meta: {
			baseline_operational_dates: baselineOperationalDates,
			baseline_sample_size: isAvailable ? BASELINE_DATE_OFFSETS.length : 0,
			baseline_sample_size_target: BASELINE_DATE_OFFSETS.length,
			current_cutoff: currentCutoff,
			current_operational_date: currentOperationalDate,
			generated_at: generatedAt,
			interval_minutes: 15,
			last_week_cutoff: lastWeekCutoff,
			last_week_operational_date: baselineOperationalDates[0] ?? currentOperationalDate,
			requested_agency_ids: [...agencyIds],
			source_watermark: generatedAt,
			status: isAvailable ? 'complete' : 'partial',
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: totalTrend,
			value: totalDemandValue,
		},
	});
	const serviceComplianceMetrics = ServiceComplianceMetricsSchema.parse({
		agencies: serviceComplianceAgencies,
		definition_version: 'service-compliance-v1',
		meta: {
			current_cutoff: currentCutoff,
			current_operational_date: currentOperationalDate,
			generated_at: generatedAt,
			interval_minutes: SERVICE_COMPLIANCE_INTERVAL_MINUTES,
			requested_agency_ids: [...agencyIds],
			status: isAvailable ? 'complete' : 'partial',
			target_pct: SERVICE_COMPLIANCE_TARGET_PCT,
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: totalServiceComplianceTrend,
			value: totalServiceComplianceValue,
		},
	});
	const departureDelayMetrics = DepartureDelayMetricsSchema.parse({
		agencies: departureDelayAgencies,
		definition_version: 'departure-delays-v1',
		meta: {
			current_cutoff: currentCutoff,
			current_operational_date: currentOperationalDate,
			generated_at: generatedAt,
			interval_minutes: DEPARTURE_DELAY_INTERVAL_MINUTES,
			requested_agency_ids: [...agencyIds],
			status: isAvailable ? 'complete' : 'partial',
			target_pct: DEPARTURE_DELAY_TARGET_PCT,
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: totalDepartureDelayTrend,
			value: totalDepartureDelayValue,
		},
	});
	const vkmExecutionMetrics = VkmExecutionMetricsSchema.parse({
		agencies: vkmExecutionAgencies,
		definition_version: 'vkm-execution-v1',
		meta: {
			current_cutoff: currentCutoff,
			current_operational_date: currentOperationalDate,
			generated_at: generatedAt,
			interval_minutes: VKM_EXECUTION_INTERVAL_MINUTES,
			requested_agency_ids: [...agencyIds],
			status: isAvailable ? 'complete' : 'partial',
			target_pct: VKM_EXECUTION_TARGET_PCT,
			unavailable_agency_ids: unavailableAgencyIds,
		},
		total: {
			trend: totalVkmExecutionTrend,
			value: totalVkmExecutionValue,
		},
	});

	return {
		demand_metrics: demandMetrics,
		departure_delay_metrics: departureDelayMetrics,
		service_compliance_metrics: serviceComplianceMetrics,
		vkm_execution_metrics: vkmExecutionMetrics,
	};
}
