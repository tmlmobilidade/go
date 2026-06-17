/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export class NetworkController {
	//

	/**
	 * Retrieve all unique line IDs from metrics collection.
	 */
	static async getUniqueLineIds(request: FastifyRequest, reply: FastifyReply<string[]>) {
		try {
			// Connect to metrics collection
			const metricsCollection = await metrics.getCollection();
			// Get unique line IDs from existing metrics
			const aggregationResult = await metricsCollection.aggregate([
				{ $group: { _id: null, uniqueValues: { $addToSet: '$properties.line_id' } } },
				{ $project: { _id: 0, uniqueValues: 1 } },
			]).toArray();
			// Send response with unique line IDs
			reply.send({
				data: aggregationResult[0].uniqueValues,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving lines' });
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve lines');
		}
	}

	/**
	 * Retrieve all unique pattern IDs from metrics collection.
	 */
	static async getUniquePatternIds(request: FastifyRequest, reply: FastifyReply<string[]>) {
		try {
			// Connect to metrics collection
			const metricsCollection = await metrics.getCollection();
			// Get unique line IDs from existing metrics
			const aggregationResult = await metricsCollection.aggregate([
				{ $group: { _id: null, uniqueValues: { $addToSet: '$properties.pattern_id' } } },
				{ $project: { _id: 0, uniqueValues: 1 } },
			]).toArray();
			// Send response with unique pattern IDs
			reply.send({
				data: aggregationResult[0].uniqueValues,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving patterns' });
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve patterns');
		}
	}

	//
}
