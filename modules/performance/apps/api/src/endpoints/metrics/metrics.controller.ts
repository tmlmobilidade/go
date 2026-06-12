/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Metric } from '@tmlmobilidade/types';

/* * */

/**
 * Build MongoDB query with property filters
 */
function buildQuery(
	metricId: string,
	filters: Record<string, unknown>,
): Record<string, unknown> {
	const query: Record<string, unknown> = { metric: metricId };

	// Filter by line_ids when provided
	if (filters.line_ids) {
		const lineIds = typeof filters.line_ids === 'string'
			? filters.line_ids.split(',').map(id => id.trim())
			: Array.isArray(filters.line_ids)
				? filters.line_ids
				: [filters.line_ids];

		query['properties.line_id'] = { $in: lineIds };
	}

	// Filter by pattern_ids when provided
	if (filters.pattern_ids) {
		const patternIds = typeof filters.pattern_ids === 'string'
			? filters.pattern_ids.split(',').map(id => id.trim())
			: Array.isArray(filters.pattern_ids)
				? filters.pattern_ids
				: [filters.pattern_ids];

		query['properties.pattern_id'] = { $in: patternIds };
	}

	return query;
}

/**
 * Filter data by date range with automatic time view detection
 *
 * Supports multiple date formats:
 * - Annual: "2025" (YYYY)
 * - Monthly: "2025-01" (YYYY-MM)
 * - Daily: "2025-01-15" (YYYY-MM-DD)
 *
 * @param data - Array of metric items to filter
 * @param startDate - Start date in any supported format
 * @param endDate - End date in any supported format
 * @returns Filtered data with matching date ranges
 */
function filterDataByDate(
	data: Metric[],
	startDate?: string,
	endDate?: string,
): Metric[] {
	// If no date filtering needed, return early
	if (!startDate && !endDate) return data;

	// Auto-detect time view based on date format
	const detectTimeView = (dateStr: string): 'annual' | 'daily' | 'monthly' => {
		if (!dateStr) return 'daily';

		if (/^\d{4}$/.test(dateStr)) {
			return 'annual'; // YYYY
		} else if (/^\d{4}-\d{2}$/.test(dateStr)) {
			return 'monthly'; // YYYY-MM
		} else {
			return 'daily'; // YYYY-MM-DD or full ISO
		}
	};

	// Determine time view from start date (prioritize start date, fallback to end date)
	const timeView = detectTimeView(startDate || endDate || '');

	// Normalize date strings for comparison based on time view
	const normalizeDate = (dateStr: string, view: 'annual' | 'daily' | 'monthly'): string => {
		if (!dateStr) return '';

		switch (view) {
			case 'annual':
				return dateStr.slice(0, 4); // YYYY
			case 'monthly':
				return dateStr.slice(0, 7); // YYYY-MM
			case 'daily':
			default:
				return dateStr.split('T')[0]; // YYYY-MM-DD (remove time if present)
		}
	};

	const normalizedStartDate = startDate ? normalizeDate(startDate, timeView) : '';
	const normalizedEndDate = endDate ? normalizeDate(endDate, timeView) : '';

	// Filter each item's data by date range
	return data.map(item => ({
		...item,
		data: Object.fromEntries(
			Object.entries(item.data || {}).filter(([date]) => {
				const normalizedItemDate = normalizeDate(date, timeView);
				const afterStart = !normalizedStartDate || normalizedItemDate >= normalizedStartDate;
				const beforeEnd = !normalizedEndDate || normalizedItemDate <= normalizedEndDate;
				return afterStart && beforeEnd;
			}),
		),
	}) as typeof item).filter(item => Object.keys(item.data).length > 0);
}

export class MetricsController {
	/**
	 * Get a metric by name - Retrieves a metric from the database by its name
	 *
	 * Query Parameters:
	 * - line_ids: Filter by line IDs (comma-separated)
	 * - pattern_ids: Filter by pattern IDs (comma-separated)
	 * - start_date: Start date filter (supports YYYY, YYYY-MM, or YYYY-MM-DD)
	 * - end_date: End date filter (supports YYYY, YYYY-MM, or YYYY-MM-DD)
	 *
	 * @param {FastifyRequest} request - The request object containing the metric name in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getMetric(request: FastifyRequest<{ Params: { id: Metric['metric'] }, Querystring: Record<string, unknown> }>, reply: FastifyReply<Metric[]>) {
		const { id } = request.params;
		const filters = request.query || {};

		try {
			// Build MongoDB query with property filters
			const query = buildQuery(id, filters);

			// Fetch metrics from database
			const metricDocs = (await metrics.findMany(query)) as Metric[];

			if (!metricDocs || metricDocs.length === 0) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Metric not found');
				Logger.issue('error', error, {
					action: 'getMetric',
					feature: 'metrics',
					request,
					value: id,
				});
				throw error;
			}

			// Apply date filtering
			const filteredDocs = filterDataByDate(
				metricDocs,
				filters.start_date as string | undefined,
				filters.end_date as string | undefined,
			);

			reply.send({
				data: filteredDocs,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error('Error retrieving metric:', error);
			const err = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve metric');
			Logger.issue('error', err, {
				action: 'getMetric',
				feature: 'metrics',
				request,
				value: id,
			});
			throw err;
		}
	}
}
