/* * */

import { buildPlannedSupplyLineDashboardInput, buildRidePerformanceBaselineComparisonInput, buildRidePerformanceBreakdownInput, buildRidePerformanceComparisonInput, buildRidePerformanceFilters, buildRidePerformanceOverTimeInput, type PlannedSupplyLineDashboardHttpQuery, type RidePerformanceBaselineComparisonHttpQuery, type RidePerformanceBreakdownHttpQuery, type RidePerformanceComparisonHttpQuery, type RidePerformanceHttpFilters, type RidePerformanceOverTimeHttpQuery } from '@/endpoints/ride-performance/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPlannedSupplyLineDashboard, queryRidePerformanceBaselineComparison, queryRidePerformanceByLine, queryRidePerformanceByPattern, queryRidePerformanceComparison, queryRidePerformanceHeatmap, queryRidePerformanceOverTime, queryRidePerformanceTotal } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PlannedSupplyLineDashboard, type RidePerformanceBaselineComparison, type RidePerformanceByLineItem, type RidePerformanceByPatternItem, type RidePerformanceComparison, type RidePerformanceHeatmapCell, type RidePerformanceMetrics, type RidePerformanceOverTimePoint } from '@tmlmobilidade/go-types-performance';

/* * */

export class RidePerformanceController {
	//

	/**
	 * Returns aggregate ride-performance quantities and percentages.
	 */
	static async getTotal(
		request: FastifyRequest<{ Querystring: RidePerformanceHttpFilters }>,
		reply: FastifyReply<RidePerformanceMetrics>,
	) {
		const data = await queryRidePerformanceTotal(buildRidePerformanceFilters(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns a daily or hourly ride-performance series.
	 */
	static async getOverTime(
		request: FastifyRequest<{ Querystring: RidePerformanceOverTimeHttpQuery }>,
		reply: FastifyReply<RidePerformanceOverTimePoint[]>,
	) {
		const data = await queryRidePerformanceOverTime(buildRidePerformanceOverTimeInput(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns current and comparison ride performance grouped by line.
	 */
	static async getByLine(
		request: FastifyRequest<{ Querystring: RidePerformanceComparisonHttpQuery }>,
		reply: FastifyReply<RidePerformanceByLineItem[]>,
	) {
		const data = await queryRidePerformanceByLine(buildRidePerformanceComparisonInput(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns ride performance grouped by pattern.
	 */
	static async getByPattern(
		request: FastifyRequest<{ Querystring: RidePerformanceBreakdownHttpQuery }>,
		reply: FastifyReply<RidePerformanceByPatternItem[]>,
	) {
		const data = await queryRidePerformanceByPattern(buildRidePerformanceBreakdownInput(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns current and comparison period totals.
	 */
	static async getComparison(
		request: FastifyRequest<{ Querystring: RidePerformanceComparisonHttpQuery }>,
		reply: FastifyReply<RidePerformanceComparison>,
	) {
		const data = await queryRidePerformanceComparison(buildRidePerformanceComparisonInput(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns current-day ride performance against a comparable-weekday median baseline.
	 */
	static async getBaselineComparison(
		request: FastifyRequest<{ Querystring: RidePerformanceBaselineComparisonHttpQuery }>,
		reply: FastifyReply<RidePerformanceBaselineComparison>,
	) {
		const data = await queryRidePerformanceBaselineComparison(buildRidePerformanceBaselineComparisonInput(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns weekday-by-hour ride-performance cells.
	 */
	static async getHeatmap(
		request: FastifyRequest<{ Querystring: RidePerformanceHttpFilters }>,
		reply: FastifyReply<RidePerformanceHeatmapCell[]>,
	) {
		const data = await queryRidePerformanceHeatmap(buildRidePerformanceFilters(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns the planned-supply dossier for one line and comparison period.
	 */
	static async getPlannedSupplyLineDashboard(
		request: FastifyRequest<{ Querystring: PlannedSupplyLineDashboardHttpQuery }>,
		reply: FastifyReply<PlannedSupplyLineDashboard>,
	) {
		const data = await queryPlannedSupplyLineDashboard(buildPlannedSupplyLineDashboardInput(request.query));
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}

/* * */
