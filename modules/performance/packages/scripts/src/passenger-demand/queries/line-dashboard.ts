/* * */

import { enrichOperationalDate } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandCompositionItem, type PassengerDemandContributionItem, type PassengerDemandDailyTotalQueryRow, PassengerDemandDailyTotalQueryRowSchema, type PassengerDemandDashboardBreakdownQueryRow, PassengerDemandDashboardBreakdownQueryRowSchema, type PassengerDemandDayType, type PassengerDemandLineDashboard, PassengerDemandLineDashboardQueryInputSchema, PassengerDemandLineDashboardSchema, type PassengerDemandProductivityMetrics, type PassengerDemandProductivityQueryRow, PassengerDemandProductivityQueryRowSchema } from '@tmlmobilidade/go-types-performance';

import { RIDE_PERFORMANCE_DEFINITION_VERSION } from '../../ride-performance/definition.js';
import { PASSENGER_DEMAND_DEFINITION_VERSION } from '../definition.js';

/* * */

function buildDemandConditions() {
	return `definition_version = $1
				AND agency_id = $2
				AND line_id = $3`;
}

function buildComparisonSelection(dimension: 'category' | 'pattern_id' | 'product_id' | 'stop_id', limit?: number) {
	return `
		SELECT
			${dimension} AS id,
			sumIf(accepted_validations_qty, operational_date BETWEEN $4 AND $5) AS current_qty,
			sumIf(accepted_validations_qty, operational_date BETWEEN $6 AND $7) AS comparison_qty
		FROM performance.${dimension === 'stop_id' ? 'passenger_demand_by_dimensions_by_5_minutes' : 'passenger_demand_by_dimensions_by_day'}
		WHERE ${buildDemandConditions()}
			AND operational_date BETWEEN least($4, $6) AND greatest($5, $7)
		GROUP BY ${dimension}
		ORDER BY current_qty DESC, id
		${limit ? `LIMIT ${limit}` : ''}
	`;
}

function getDayType(value: number): PassengerDemandDayType | undefined {
	const enrichedDate = enrichOperationalDate(value);
	if (!enrichedDate) return undefined;
	if (enrichedDate.day_type === '1') return 'weekday';
	if (enrichedDate.day_type === '2') return 'saturday';
	return 'sunday_holiday';
}

function normalizeComposition(rows: PassengerDemandDashboardBreakdownQueryRow[]): PassengerDemandCompositionItem[] {
	const currentTotal = rows.reduce((total, row) => total + Number(row.current_qty), 0);
	const comparisonTotal = rows.reduce((total, row) => total + Number(row.comparison_qty), 0);

	return rows.map((row) => {
		const currentQty = Number(row.current_qty);
		const comparisonQty = Number(row.comparison_qty);
		const currentShare = currentTotal ? currentQty / currentTotal * 100 : 0;
		const comparisonShare = comparisonTotal ? comparisonQty / comparisonTotal * 100 : 0;

		return {
			comparison_qty: comparisonQty,
			comparison_share_pct: comparisonShare,
			current_qty: currentQty,
			current_share_pct: currentShare,
			id: row.id,
			share_delta_pp: currentShare - comparisonShare,
		};
	});
}

function normalizeContributions(rows: PassengerDemandDashboardBreakdownQueryRow[]): PassengerDemandContributionItem[] {
	return rows.map(row => ({
		comparison_qty: Number(row.comparison_qty),
		current_qty: Number(row.current_qty),
		difference_qty: Number(row.current_qty) - Number(row.comparison_qty),
		id: row.id,
	}));
}

function normalizeProductivity(validations: number, scheduled: number, failures: number, distanceMetres: number): PassengerDemandProductivityMetrics {
	const operatedRides = Math.max(0, scheduled - failures);
	const deliveredVehicleKm = distanceMetres / 1_000;
	return {
		delivered_vehicle_km: deliveredVehicleKm,
		operated_rides_qty: operatedRides,
		validations_per_delivered_vehicle_km: deliveredVehicleKm ? validations / deliveredVehicleKm : null,
		validations_per_operated_ride: operatedRides ? validations / operatedRides : null,
	};
}

/* * */

export function buildPassengerDemandLineDashboardQueries(input: unknown) {
	const parsed = PassengerDemandLineDashboardQueryInputSchema.parse(input);
	const params = {
		1: PASSENGER_DEMAND_DEFINITION_VERSION,
		2: parsed.agency_id,
		3: parsed.line_id,
		4: parsed.current_period.start_date,
		5: parsed.current_period.end_date,
		6: parsed.comparison_period.start_date,
		7: parsed.comparison_period.end_date,
		8: parsed.record_period.start_date,
		9: parsed.record_period.end_date,
	};

	return {
		breakdownParams: params,
		categoryQuery: buildComparisonSelection('category'),
		patternQuery: buildComparisonSelection('pattern_id', 25),
		productivityParams: { ...params, 1: RIDE_PERFORMANCE_DEFINITION_VERSION },
		productivityQuery: `
			SELECT
				sumIf(scheduled_rides_total_qty, operational_date BETWEEN $4 AND $5) AS current_scheduled_rides_qty,
				sumIf(combined_execution_failure_rides_qty, operational_date BETWEEN $4 AND $5) AS current_execution_failures_qty,
				sumIf(combined_executed_distance_m, operational_date BETWEEN $4 AND $5) AS current_distance_m,
				sumIf(scheduled_rides_total_qty, operational_date BETWEEN $6 AND $7) AS comparison_scheduled_rides_qty,
				sumIf(combined_execution_failure_rides_qty, operational_date BETWEEN $6 AND $7) AS comparison_execution_failures_qty,
				sumIf(combined_executed_distance_m, operational_date BETWEEN $6 AND $7) AS comparison_distance_m
			FROM performance.ride_service_by_ride
			WHERE definition_version = $1
				AND agency_id = $2
				AND line_id = $3
				AND operational_date BETWEEN least($4, $6) AND greatest($5, $7)
		`,
		productQuery: buildComparisonSelection('product_id'),
		recordParams: params,
		recordQuery: `
			SELECT
				operational_date,
				sum(accepted_validations_qty) AS passenger_demand
			FROM performance.passenger_demand_by_dimensions_by_day
			WHERE ${buildDemandConditions()}
				AND operational_date BETWEEN $8 AND $9
			GROUP BY operational_date
			ORDER BY operational_date
		`,
		stopQuery: buildComparisonSelection('stop_id', 25),
	};
}

export async function queryPassengerDemandLineDashboard(input: unknown): Promise<PassengerDemandLineDashboard> {
	const parsed = PassengerDemandLineDashboardQueryInputSchema.parse(input);
	const queries = buildPassengerDemandLineDashboardQueries(parsed);
	const [categoryRaw, productRaw, patternRaw, stopRaw, recordRaw, productivityRaw] = await Promise.all([
		labDb.performance.passengerDemandByDimensionsByDay.queryFromString<PassengerDemandDashboardBreakdownQueryRow>(queries.categoryQuery, queries.breakdownParams),
		labDb.performance.passengerDemandByDimensionsByDay.queryFromString<PassengerDemandDashboardBreakdownQueryRow>(queries.productQuery, queries.breakdownParams),
		labDb.performance.passengerDemandByDimensionsByDay.queryFromString<PassengerDemandDashboardBreakdownQueryRow>(queries.patternQuery, queries.breakdownParams),
		labDb.performance.passengerDemandByDimensionsBy5Minutes.queryFromString<PassengerDemandDashboardBreakdownQueryRow>(queries.stopQuery, queries.breakdownParams),
		labDb.performance.passengerDemandByDimensionsByDay.queryFromString<PassengerDemandDailyTotalQueryRow>(queries.recordQuery, queries.recordParams),
		labDb.performance.rideServiceByRide.queryFromString<PassengerDemandProductivityQueryRow>(queries.productivityQuery, queries.productivityParams),
	]);
	const categories = PassengerDemandDashboardBreakdownQueryRowSchema.array().parse(categoryRaw);
	const products = PassengerDemandDashboardBreakdownQueryRowSchema.array().parse(productRaw);
	const patterns = PassengerDemandDashboardBreakdownQueryRowSchema.array().parse(patternRaw);
	const stops = PassengerDemandDashboardBreakdownQueryRowSchema.array().parse(stopRaw);
	const dailyTotals = PassengerDemandDailyTotalQueryRowSchema.array().parse(recordRaw);
	const productivity = PassengerDemandProductivityQueryRowSchema.parse(productivityRaw[0]);
	const recordByDayType = new Map<PassengerDemandDayType, { day_type: PassengerDemandDayType, operational_date: number, passenger_demand: number }>();

	for (const row of dailyTotals) {
		const operationalDate = Number(row.operational_date);
		const dayType = getDayType(operationalDate);
		const passengerDemand = Number(row.passenger_demand);
		const current = dayType ? recordByDayType.get(dayType) : undefined;
		if (dayType && (!current || passengerDemand > current.passenger_demand)) {
			recordByDayType.set(dayType, { day_type: dayType, operational_date: operationalDate, passenger_demand: passengerDemand });
		}
	}

	const currentValidations = categories.reduce((total, row) => total + Number(row.current_qty), 0);
	const comparisonValidations = categories.reduce((total, row) => total + Number(row.comparison_qty), 0);
	const currentScheduled = Number(productivity.current_scheduled_rides_qty);
	const comparisonScheduled = Number(productivity.comparison_scheduled_rides_qty);

	return PassengerDemandLineDashboardSchema.parse({
		composition: {
			categories: normalizeComposition(categories),
			products: normalizeComposition(products),
		},
		contributions: {
			patterns: normalizeContributions(patterns),
			stops: normalizeContributions(stops),
		},
		productivity: {
			comparison: normalizeProductivity(comparisonValidations, comparisonScheduled, Number(productivity.comparison_execution_failures_qty), Number(productivity.comparison_distance_m)),
			current: normalizeProductivity(currentValidations, currentScheduled, Number(productivity.current_execution_failures_qty), Number(productivity.current_distance_m)),
		},
		records: [...recordByDayType.values()],
	});
}
