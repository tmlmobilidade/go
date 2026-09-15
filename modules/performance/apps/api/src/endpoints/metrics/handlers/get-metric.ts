/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Metric } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';

/* * */

type MetricTimeView = 'annual' | 'daily' | 'monthly';

interface GetMetricQuerystring {
	end_date?: string
	line_ids?: string | string[]
	pattern_ids?: string | string[]
	start_date?: string
}

/* * */

/**
 * Normalizes a comma-separated string or an array of IDs into an array of trimmed IDs.
 * @param value The querystring value
 */
function parseIdList(value: string | string[]): string[] {
	return typeof value === 'string'
		? value.split(',').map(id => id.trim())
		: value;
}

/**
 * Builds the MongoDB query for a metric with the optional line and pattern filters.
 * @param metricId The metric name
 * @param filters The querystring filters
 */
function buildMetricsQuery(metricId: Metric['metric'], filters: GetMetricQuerystring): Record<string, unknown> {
	const query: Record<string, unknown> = { metric: metricId };

	if (filters.line_ids) {
		query['properties.line_id'] = { $in: parseIdList(filters.line_ids) };
	}

	if (filters.pattern_ids) {
		query['properties.pattern_id'] = { $in: parseIdList(filters.pattern_ids) };
	}

	return query;
}

/**
 * Detects the time view of a date string:
 * `YYYY` is annual, `YYYY-MM` is monthly and anything else is daily.
 * @param dateStr The date string
 */
function detectTimeView(dateStr: string): MetricTimeView {
	if (/^\d{4}$/.test(dateStr)) return 'annual';
	if (/^\d{4}-\d{2}$/.test(dateStr)) return 'monthly';
	return 'daily';
}

/**
 * Normalizes a date string to the comparable form of the given time view.
 * @param dateStr The date string
 * @param view The time view
 */
function normalizeDate(dateStr: string, view: MetricTimeView): string {
	if (!dateStr) return '';
	switch (view) {
		case 'annual':
			return dateStr.slice(0, 4);
		case 'monthly':
			return dateStr.slice(0, 7);
		case 'daily':
		default:
			return dateStr.split('T')[0];
	}
}

/**
 * Filters the `data` entries of each metric document by the given date range,
 * detecting the time view from the format of the start (or end) date.
 * Documents left without entries are dropped.
 * @param data The metric documents
 * @param startDate The start date in `YYYY`, `YYYY-MM` or `YYYY-MM-DD` format
 * @param endDate The end date in `YYYY`, `YYYY-MM` or `YYYY-MM-DD` format
 */
function filterMetricsByDate(data: Metric[], startDate?: string, endDate?: string): Metric[] {
	if (!startDate && !endDate) return data;

	const timeView = detectTimeView(startDate || endDate || '');

	const normalizedStartDate = startDate ? normalizeDate(startDate, timeView) : '';
	const normalizedEndDate = endDate ? normalizeDate(endDate, timeView) : '';

	return data
		.map(item => ({
			...item,
			data: Object.fromEntries(
				Object.entries(item.data || {}).filter(([date]) => {
					const normalizedItemDate = normalizeDate(date, timeView);
					const afterStart = !normalizedStartDate || normalizedItemDate >= normalizedStartDate;
					const beforeEnd = !normalizedEndDate || normalizedItemDate <= normalizedEndDate;
					return afterStart && beforeEnd;
				}),
			),
		}) as typeof item)
		.filter(item => Object.keys(item.data).length > 0);
}

/* * */

/**
 * Returns the documents of a metric, optionally filtered by line IDs,
 * pattern IDs and a date range (`YYYY`, `YYYY-MM` or `YYYY-MM-DD`).
 * @param request The request object
 * @param reply The reply object
 */
export async function getMetricHandler(request: FastifyRequest<{ Params: { id: Metric['metric'] }, Querystring: GetMetricQuerystring }>, reply: FastifyReply<Metric[]>) {
	//

	//
	// Get the metric documents matching the filters

	const filters = request.query || {};

	const query = buildMetricsQuery(request.params.id, filters);

	const foundMetrics = (await metrics.findMany(query)) as Metric[];

	if (!foundMetrics?.length) {
		return sendErrorApiResponse(reply, {
			error: `Metric with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Apply the date range filter

	const filteredMetrics = filterMetricsByDate(foundMetrics, filters.start_date, filters.end_date);

	return sendSuccessApiResponse(reply, filteredMetrics);
}
