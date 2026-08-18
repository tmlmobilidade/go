/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { queryAvailablePassengerDemandAgencyIds, queryPerformanceNetworkLine, queryPerformanceNetworkLines } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PerformanceNetworkAgency, PerformanceNetworkAgencySchema, type PerformanceNetworkLine, type PerformanceNetworkLineDetail, PerformanceNetworkLineDetailSchema } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

import { parsePerformanceNetworkLineIdentity, parsePerformanceNetworkLinesQuery, parsePerformanceNetworkPeriod, type PerformanceNetworkHttpQuery } from './query-params.js';

/* * */

export class NetworkController {
	//

	/**
	 * Retrieve agencies represented in Performance data and enrich them with GO metadata.
	 */
	static async getAgencies(request: FastifyRequest, reply: FastifyReply<PerformanceNetworkAgency[]>) {
		try {
			const metricAgencyIds = await queryAvailablePassengerDemandAgencyIds();
			const agencies = metricAgencyIds.length
				? await goDb.core.agencies.findMany(
					{ $or: [{ _id: { $in: metricAgencyIds } }, { code: { $in: metricAgencyIds } }] },
					{ projection: { _id: 1, code: 1, name: 1, public_name: 1, short_name: 1 } },
				)
				: [];
			const agencyByMetricId = new Map<string, typeof agencies[number]>();

			for (const agency of agencies) {
				agencyByMetricId.set(agency._id, agency);
				agencyByMetricId.set(agency.code, agency);
			}

			const responseByAgencyId = new Map<string, PerformanceNetworkAgency>();
			for (const metricAgencyId of metricAgencyIds) {
				const agency = agencyByMetricId.get(metricAgencyId);
				const agencyId = agency?._id ?? metricAgencyId;
				const current = responseByAgencyId.get(agencyId);

				if (current) {
					current.metric_ids.push(metricAgencyId);
					continue;
				}

				responseByAgencyId.set(agencyId, PerformanceNetworkAgencySchema.parse({
					_id: agencyId,
					code: agency?.code ?? metricAgencyId,
					metric_ids: [metricAgencyId],
					name: agency?.name ?? metricAgencyId,
					public_name: agency?.public_name ?? agency?.name ?? metricAgencyId,
					short_name: agency?.short_name ?? agency?.code ?? metricAgencyId,
				}));
			}

			const response = [...responseByAgencyId.values()].sort((a, b) => (
				a.public_name.localeCompare(b.public_name, 'pt-PT')
			));

			reply.send({ data: response, error: null, statusCode: HTTP_STATUS.OK });
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving Performance agencies' });
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve Performance agencies');
		}
	}

	/**
	 * Retrieve the metadata required by a Performance line detail screen.
	 */
	static async getLine(
		request: FastifyRequest<{ Params: { lineId: string }, Querystring: PerformanceNetworkHttpQuery }>,
		reply: FastifyReply<PerformanceNetworkLineDetail>,
	) {
		try {
			const identity = parsePerformanceNetworkLineIdentity(request.params.lineId);
			const period = parsePerformanceNetworkPeriod(request.query);
			const result = await queryPerformanceNetworkLine({
				...identity,
				...period,
			});
			if (!result) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Line not found');

			const agency = await goDb.core.agencies.findOne(
				{ $or: [{ _id: result.line.agency_id }, { code: result.line.agency_id }] },
				{ projection: { public_name: 1, short_name: 1 } },
			);

			const response = PerformanceNetworkLineDetailSchema.parse({
				...result.line,
				agency_name: agency?.public_name ?? result.line.agency_id,
				agency_short_name: agency?.short_name ?? result.line.agency_id,
				pattern_count: result.patterns.length,
				patterns: result.patterns,
			});

			reply.send({ data: response, error: null, statusCode: HTTP_STATUS.OK });
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving line' });
			if (error instanceof HttpException) throw error;
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve line');
		}
	}

	/**
	 * Retrieve the line metadata required by Performance screens.
	 */
	static async getLines(
		request: FastifyRequest<{ Querystring: PerformanceNetworkHttpQuery }>,
		reply: FastifyReply<PerformanceNetworkLine[]>,
	) {
		try {
			const response = await queryPerformanceNetworkLines(
				parsePerformanceNetworkLinesQuery(request.query),
			);

			reply.send({
				data: response,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving lines' });
			if (error instanceof HttpException) throw error;
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
