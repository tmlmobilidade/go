/* * */

import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { metrics } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';

/* * */

export class NetworkController {
	/**
	 * Get distinct lines - Retrieves all unique, non-null, non-empty line IDs from metrics collection
	 */
	static async getLines(
		request: FastifyRequest,
		reply: FastifyReply<string[]>,
	) {
		try {
			// Get metrics with demand_by_line_by_year and extract line_ids from properties
			const lineMetrics = await metrics.findMany({
				metric: 'demand_by_line_by_year',
			}) as Metric[];

			// Extract line_id from properties of each metric document
			const lineIds = lineMetrics
				.map(metric => (metric as { properties?: { line_id?: string } }).properties?.line_id)
				.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
				.filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
				.sort();

			if (lineIds.length === 0) {
				throw new HttpException(HttpStatus.NOT_FOUND, 'No valid line IDs found');
			}

			reply.send({
				data: lineIds,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			console.error(error);
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve lines');
		}
	}

	/**
	 * Get distinct patterns - Retrieves all unique, non-null, non-empty pattern IDs from metrics collection
	 */
	static async getPatterns(
		request: FastifyRequest,
		reply: FastifyReply<string[]>,
	) {
		try {
			// Get metrics with demand_by_pattern_by_year and extract pattern_ids from properties
			const patternMetrics = await metrics.findMany({
				metric: 'demand_by_pattern_by_year',
			}) as Metric[];

			// Extract pattern_id from properties of each metric document
			const patternIds = patternMetrics
				.map(metric => (metric as { properties?: { pattern_id?: string } }).properties?.pattern_id)
				.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
				.filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
				.sort();

			if (patternIds.length === 0) {
				throw new HttpException(HttpStatus.NOT_FOUND, 'No valid pattern IDs found');
			}

			reply.send({
				data: patternIds,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			console.error(error);
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve patterns');
		}
	}
}
