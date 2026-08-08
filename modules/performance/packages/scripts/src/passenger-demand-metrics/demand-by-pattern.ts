/* * */

import { PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION } from '@/passenger-demand-history/constants.js';
import { DEMAND_PERIOD_EXPRESSIONS, formatDemandPeriod } from '@/passenger-demand-metrics/utils/period.js';
import { enrichOperationalDate } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type DemandByPatternByDay, type DemandByPatternByMonth, type DemandByPatternByYear, type DemandByPatternMetric, DemandByPatternMetricSchema, type DemandByPatternQueryInput, type DemandByPatternQueryRow, DemandByPatternQueryRowSchema, type DemandByPatternTimeGrain } from '@tmlmobilidade/go-types-performance';

/* * */

export function buildDemandByPatternQuery(input: DemandByPatternQueryInput) {
	const conditions = ['definition_version = $1'];
	const params: Record<string, number | string | string[]> = {
		1: PASSENGER_DEMAND_HISTORY_DEFINITION_VERSION,
	};
	let nextParamIndex = 2;

	if (input.pattern_ids?.length) {
		conditions.push(`pattern_id IN $${nextParamIndex}`);
		params[nextParamIndex] = input.pattern_ids;
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
				pattern_id,
				sum(accepted_validations_qty) AS qty
			FROM performance.passenger_demand_by_dimensions_by_day
			WHERE ${conditions.join('\n\t\t\t\tAND ')}
			GROUP BY period, pattern_id
			ORDER BY pattern_id, period
		`,
	};
}

function buildDailyDemandByPatternMetrics(
	rows: DemandByPatternQueryRow[],
	generatedAt: Date,
) {
	const metricsByPattern = new Map<string, DemandByPatternByDay>();

	for (const row of rows) {
		const enrichedOperationalDate = enrichOperationalDate(row.period);
		if (!enrichedOperationalDate) continue;

		const operationalDate = enrichedOperationalDate.calendar_date;
		let metric = metricsByPattern.get(row.pattern_id);

		if (!metric) {
			metric = {
				data: {},
				description: `Aggregated passenger demand for pattern ${row.pattern_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_pattern_by_day',
				properties: { pattern_id: row.pattern_id },
			};
			metricsByPattern.set(row.pattern_id, metric);
		}

		metric.data[operationalDate] = {
			day_type: enrichedOperationalDate.day_type,
			holiday: enrichedOperationalDate.holiday,
			notes: enrichedOperationalDate.notes,
			period: enrichedOperationalDate.period,
			qty: Number(row.qty),
		};
	}

	return [...metricsByPattern.values()];
}

function buildSummaryDemandByPatternMetrics(
	rows: DemandByPatternQueryRow[],
	timeGrain: Exclude<DemandByPatternTimeGrain, 'day'>,
	generatedAt: Date,
) {
	const metricsByPattern = new Map<string, DemandByPatternByMonth | DemandByPatternByYear>();

	for (const row of rows) {
		const period = formatDemandPeriod(row.period, timeGrain);
		const existingMetric = metricsByPattern.get(row.pattern_id);

		if (existingMetric) {
			existingMetric.data[period] = { qty: Number(row.qty) };
			continue;
		}

		const newMetric = timeGrain === 'month'
			? {
				data: { [period]: { qty: Number(row.qty) } },
				description: `Aggregated passenger demand for pattern ${row.pattern_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_pattern_by_month',
				properties: { pattern_id: row.pattern_id },
			} satisfies DemandByPatternByMonth
			: {
				data: { [period]: { qty: Number(row.qty) } },
				description: `Aggregated passenger demand for pattern ${row.pattern_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_pattern_by_year',
				properties: { pattern_id: row.pattern_id },
			} satisfies DemandByPatternByYear;

		metricsByPattern.set(row.pattern_id, newMetric);
	}

	return [...metricsByPattern.values()];
}

export function buildDemandByPatternMetrics(
	rows: DemandByPatternQueryRow[],
	timeGrain: DemandByPatternTimeGrain,
	generatedAt = new Date(),
): DemandByPatternMetric[] {
	const metrics = timeGrain === 'day'
		? buildDailyDemandByPatternMetrics(rows, generatedAt)
		: buildSummaryDemandByPatternMetrics(rows, timeGrain, generatedAt);

	return DemandByPatternMetricSchema.array().parse(metrics);
}

export async function queryDemandByPattern(input: DemandByPatternQueryInput) {
	const { params, query } = buildDemandByPatternQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsByDay.queryFromString<DemandByPatternQueryRow>(query, params);
	const rows = DemandByPatternQueryRowSchema.array().parse(rawRows);
	return buildDemandByPatternMetrics(rows, input.time_grain);
}
