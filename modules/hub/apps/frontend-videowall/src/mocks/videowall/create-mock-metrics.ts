/* * */

import {
	type PassengerDemandMetrics,
	PassengerDemandMetricsSchema,
	type PassengerDemandValue,
	type VideowallDemandValue,
	type VideowallMetrics,
	VideowallMetricsSchema,
	type VideowallServiceValue,
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
const FIFTEEN_MINUTES = 15 * 60 * 1_000;
const TREND_POINT_COUNT = 49;

export interface VideowallMockMetrics {
	demand_metrics: PassengerDemandMetrics
	metrics: VideowallMetrics
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

function toVideowallDemandValue(value: PassengerDemandValue): VideowallDemandValue {
	return {
		comparison_index_pct: value.comparison_index_pct,
		passenger_validations_qty_last_week: value.passenger_validations_qty_last_week,
		passenger_validations_qty_now: value.passenger_validations_qty_now,
	};
}

function createServiceValue(
	scenario: Exclude<VideowallMockScenario, 'unavailable'>,
	weight = 1,
): VideowallServiceValue {
	const definition = VIDEOWALL_SCENARIOS[scenario].service;
	const scheduledUntilCutoff = scaleInteger(1_200, weight);
	const scheduledTotal = scaleInteger(1_680, weight);
	const scheduledDistance = scaleMeasure(84_000, weight);
	const executedDistance = scheduledDistance * definition.distance_delivery_ratio;

	return {
		delays: {
			average_start_delay_minutes: definition.average_delay_minutes,
			delayed_for_more_than_five_minutes_rides_qty: Math.round(
				scheduledUntilCutoff * definition.delayed_ratio,
			),
			start_delay_sample_qty: scheduledUntilCutoff,
		},
		sla: {
			scheduled_rides_total_qty: scheduledTotal,
			scheduled_rides_until_cutoff_qty: scheduledUntilCutoff,
			simple_one_apex_validation_fail_rides_qty: Math.round(
				scheduledUntilCutoff * definition.failure_ratio * 0.85,
			),
			simple_three_vehicle_events_fail_rides_qty: Math.round(
				scheduledUntilCutoff * definition.failure_ratio * 0.75,
			),
			simple_three_vehicle_events_or_apex_validation_fail_rides_qty: Math.round(
				scheduledUntilCutoff * definition.failure_ratio,
			),
		},
		vkm: {
			scheduled_distance_km: scheduledDistance,
			simple_one_apex_validation_distance_km: executedDistance * 0.98,
			simple_three_vehicle_events_distance_km: executedDistance * 0.97,
			simple_three_vehicle_events_or_apex_validation_distance_km: executedDistance,
		},
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
	const totalServiceValue = isAvailable ? createServiceValue(readyScenario) : null;
	const totalTrend = isAvailable
		? createTrend(readyScenario, operationalDateStartTimestamp)
		: [];

	const demandAgencies = agencyIds.map((agencyId) => {
		const weight = weights[agencyId] ?? 0;
		return {
			agency_id: agencyId,
			availability: isAvailable,
			trend: isAvailable ? createTrend(readyScenario, operationalDateStartTimestamp, weight) : [],
			value: isAvailable ? createDemandValue(readyScenario, weight) : null,
		};
	});
	const agencies = demandAgencies.map((agency) => {
		const weight = weights[agency.agency_id] ?? 0;
		return {
			agency_id: agency.agency_id,
			availability: {
				demand: isAvailable,
				service: isAvailable,
			},
			demand: agency.value ? toVideowallDemandValue(agency.value) : null,
			service: isAvailable ? createServiceValue(readyScenario, weight) : null,
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
	const metrics = VideowallMetricsSchema.parse({
		agencies,
		definition_version: 'videowall-v2',
		meta: {
			demand: {
				current_cutoff: currentCutoff,
				current_operational_date: currentOperationalDate,
				definition_version: 'passenger-demand-v2',
				generated_at: generatedAt,
				last_week_cutoff: lastWeekCutoff,
				last_week_operational_date: baselineOperationalDates[0] ?? currentOperationalDate,
			},
			requested_agency_ids: [...agencyIds],
			service: {
				definition_version: 'videowall-service-legacy-v1',
				eligible_scheduled_cutoff: generatedAt - 5 * 60 * 1_000,
				generated_at: generatedAt,
				operational_date: currentOperationalDate,
				reference_cutoff: generatedAt,
			},
			sources_aligned: true,
			status: isAvailable ? 'complete' : 'partial',
			unavailable_demand_agency_ids: unavailableAgencyIds,
			unavailable_service_agency_ids: unavailableAgencyIds,
		},
		total: {
			demand: totalDemandValue ? toVideowallDemandValue(totalDemandValue) : null,
			service: totalServiceValue,
		},
	});

	return {
		demand_metrics: demandMetrics,
		metrics,
	};
}
