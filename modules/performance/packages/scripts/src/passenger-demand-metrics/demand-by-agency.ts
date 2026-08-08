/* * */

import { PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION } from '@/passenger-demand-history/constants.js';
import { DEMAND_PERIOD_EXPRESSIONS, formatDemandPeriod } from '@/passenger-demand-metrics/utils/period.js';
import { enrichOperationalDate } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type DemandByAgencyByDay, type DemandByAgencyByMonth, type DemandByAgencyByYear, type DemandByAgencyMetric, DemandByAgencyMetricSchema, type DemandByAgencyQueryInput, type DemandByAgencyQueryRow, DemandByAgencyQueryRowSchema, type DemandByAgencyTimeGrain } from '@tmlmobilidade/go-types-performance';

/* * */

export function buildDemandByAgencyQuery(input: DemandByAgencyQueryInput) {
	const conditions = ['definition_version = $1'];
	const params: Record<string, number | string | string[]> = {
		1: PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION,
	};
	let nextParamIndex = 2;

	if (input.agency_ids?.length) {
		conditions.push(`agency_id IN $${nextParamIndex}`);
		params[nextParamIndex] = input.agency_ids;
		nextParamIndex += 1;
	}

	if (input.start_date !== undefined) {
		conditions.push(`operational_date >= $${nextParamIndex}`);
		params[nextParamIndex] = input.start_date;
		nextParamIndex += 1;
	}

	if (input.end_date !== undefined) {
		conditions.push(`operational_date <= $${nextParamIndex}`);
		params[nextParamIndex] = input.end_date;
	}

	const periodExpression = DEMAND_PERIOD_EXPRESSIONS[input.time_grain];

	return {
		params,
		query: `
			SELECT
				${periodExpression} AS period,
				agency_id,
				sum(accepted_validations_qty) AS qty
			FROM performance.passenger_demand_by_dimensions_by_day
			WHERE ${conditions.join('\n\t\t\t\tAND ')}
			GROUP BY period, agency_id
			ORDER BY agency_id, period
		`,
	};
}

function buildDailyDemandByAgencyMetrics(
	rows: DemandByAgencyQueryRow[],
	generatedAt: Date,
) {
	const metricsByAgency = new Map<string, DemandByAgencyByDay>();

	for (const row of rows) {
		const enrichedOperationalDate = enrichOperationalDate(row.period);

		// Preserve the legacy daily contract: dates without calendar metadata are
		// omitted until the static calendar snapshot is refreshed.
		if (!enrichedOperationalDate) continue;

		const operationalDate = enrichedOperationalDate.calendar_date;

		let metric = metricsByAgency.get(row.agency_id);
		if (!metric) {
			metric = {
				data: {},
				description: `Aggregated passenger demand for agency ${row.agency_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_agency_by_day',
				properties: { agency_id: row.agency_id },
			};
			metricsByAgency.set(row.agency_id, metric);
		}

		metric.data[operationalDate] = {
			day_type: enrichedOperationalDate.day_type,
			holiday: enrichedOperationalDate.holiday,
			notes: enrichedOperationalDate.notes,
			period: enrichedOperationalDate.period,
			qty: Number(row.qty),
		};
	}

	return [...metricsByAgency.values()];
}

function buildSummaryDemandByAgencyMetrics(
	rows: DemandByAgencyQueryRow[],
	timeGrain: Exclude<DemandByAgencyTimeGrain, 'day'>,
	generatedAt: Date,
) {
	const metricsByAgency = new Map<string, DemandByAgencyByMonth | DemandByAgencyByYear>();

	for (const row of rows) {
		const period = formatDemandPeriod(row.period, timeGrain);
		const existingMetric = metricsByAgency.get(row.agency_id);

		if (existingMetric) {
			existingMetric.data[period] = { qty: Number(row.qty) };
			continue;
		}

		const newMetric = timeGrain === 'month'
			? {
				data: { [period]: { qty: Number(row.qty) } },
				description: `Aggregated passenger demand for agency ${row.agency_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_agency_by_month',
				properties: { agency_id: row.agency_id },
			} satisfies DemandByAgencyByMonth
			: {
				data: { [period]: { qty: Number(row.qty) } },
				description: `Aggregated passenger demand for agency ${row.agency_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_agency_by_year',
				properties: { agency_id: row.agency_id },
			} satisfies DemandByAgencyByYear;

		metricsByAgency.set(row.agency_id, newMetric);
	}

	return [...metricsByAgency.values()];
}

export function buildDemandByAgencyMetrics(
	rows: DemandByAgencyQueryRow[],
	timeGrain: DemandByAgencyTimeGrain,
	generatedAt = new Date(),
): DemandByAgencyMetric[] {
	const metrics = timeGrain === 'day'
		? buildDailyDemandByAgencyMetrics(rows, generatedAt)
		: buildSummaryDemandByAgencyMetrics(rows, timeGrain, generatedAt);

	return DemandByAgencyMetricSchema.array().parse(metrics);
}

export async function queryDemandByAgency(input: DemandByAgencyQueryInput) {
	const { params, query } = buildDemandByAgencyQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsByDay.queryFromString<DemandByAgencyQueryRow>(query, params);
	const rows = DemandByAgencyQueryRowSchema.array().parse(rawRows);
	return buildDemandByAgencyMetrics(rows, input.time_grain);
}
