/* * */

import { enrichOperationalDate } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type DemandByLineByDay, type DemandByLineByMonth, type DemandByLineByYear, type DemandByLineMetric, DemandByLineMetricSchema, type DemandByLineQueryInput, type DemandByLineQueryRow, DemandByLineQueryRowSchema, type DemandByLineTimeGrain } from '@tmlmobilidade/go-types-performance';

import { PASSENGER_DEMAND_DEFINITION_VERSION } from '../../definition.js';
import { DEMAND_PERIOD_EXPRESSIONS, formatDemandPeriod } from './period.js';

/* * */

export function buildDailyPassengerDemandOverTimeByLineQuery(input: DemandByLineQueryInput) {
	const conditions = ['definition_version = $1'];
	const params: Record<string, number | string | string[]> = {
		1: PASSENGER_DEMAND_DEFINITION_VERSION,
	};
	let nextParamIndex = 2;

	if (input.line_ids?.length) {
		conditions.push(`line_id IN $${nextParamIndex}`);
		params[nextParamIndex] = input.line_ids;
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
				line_id,
				sum(accepted_validations_qty) AS qty
			FROM performance.passenger_demand_by_dimensions_by_day
			WHERE ${conditions.join('\n\t\t\t\tAND ')}
			GROUP BY period, line_id
			ORDER BY line_id, period
		`,
	};
}

function buildDailyDemandByLineMetrics(
	rows: DemandByLineQueryRow[],
	generatedAt: Date,
) {
	const metricsByLine = new Map<string, DemandByLineByDay>();

	for (const row of rows) {
		const enrichedOperationalDate = enrichOperationalDate(row.period);
		if (!enrichedOperationalDate) continue;

		const operationalDate = enrichedOperationalDate.calendar_date;
		let metric = metricsByLine.get(row.line_id);

		if (!metric) {
			metric = {
				data: {},
				description: `Aggregated passenger demand for line ${row.line_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_line_by_day',
				properties: { line_id: row.line_id },
			};
			metricsByLine.set(row.line_id, metric);
		}

		metric.data[operationalDate] = {
			day_type: enrichedOperationalDate.day_type,
			holiday: enrichedOperationalDate.holiday,
			notes: enrichedOperationalDate.notes,
			period: enrichedOperationalDate.period,
			qty: Number(row.qty),
		};
	}

	return [...metricsByLine.values()];
}

function buildSummaryDemandByLineMetrics(
	rows: DemandByLineQueryRow[],
	timeGrain: Exclude<DemandByLineTimeGrain, 'day'>,
	generatedAt: Date,
) {
	const metricsByLine = new Map<string, DemandByLineByMonth | DemandByLineByYear>();

	for (const row of rows) {
		const period = formatDemandPeriod(row.period, timeGrain);
		const existingMetric = metricsByLine.get(row.line_id);

		if (existingMetric) {
			existingMetric.data[period] = { qty: Number(row.qty) };
			continue;
		}

		const newMetric = timeGrain === 'month'
			? {
				data: { [period]: { qty: Number(row.qty) } },
				description: `Aggregated passenger demand for line ${row.line_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_line_by_month',
				properties: { line_id: row.line_id },
			} satisfies DemandByLineByMonth
			: {
				data: { [period]: { qty: Number(row.qty) } },
				description: `Aggregated passenger demand for line ${row.line_id}`,
				generated_at: generatedAt,
				metric: 'demand_by_line_by_year',
				properties: { line_id: row.line_id },
			} satisfies DemandByLineByYear;

		metricsByLine.set(row.line_id, newMetric);
	}

	return [...metricsByLine.values()];
}

export function buildDailyPassengerDemandByLineMetrics(
	rows: DemandByLineQueryRow[],
	timeGrain: DemandByLineTimeGrain,
	generatedAt = new Date(),
): DemandByLineMetric[] {
	const metrics = timeGrain === 'day'
		? buildDailyDemandByLineMetrics(rows, generatedAt)
		: buildSummaryDemandByLineMetrics(rows, timeGrain, generatedAt);

	return DemandByLineMetricSchema.array().parse(metrics);
}

export async function queryDailyPassengerDemandOverTimeByLine(input: DemandByLineQueryInput) {
	const { params, query } = buildDailyPassengerDemandOverTimeByLineQuery(input);
	const rawRows = await labDb.performance.passengerDemandByDimensionsByDay.queryFromString<DemandByLineQueryRow>(query, params);
	const rows = DemandByLineQueryRowSchema.array().parse(rawRows);
	return buildDailyPassengerDemandByLineMetrics(rows, input.time_grain);
}
