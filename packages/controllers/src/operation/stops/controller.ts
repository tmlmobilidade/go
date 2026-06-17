/* * */

import { getOperationalStopsBatch } from '@/operation/stops/batch.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type ActionsOf, type GetOperationalStopsBatchQuery, GetOperationalStopsBatchQuerySchema, type OperationalStop, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

export class OperationalStopsSharedController {
	//

	/**
	 * Gets a batch of Operational Stops built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch<S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetOperationalStopsBatchQuery }>, reply: FastifyReply<OperationalStop[]>, scope: S, action: ActionsOf<S>) {
		//

		const parsedQuery = GetOperationalStopsBatchQuerySchema.parse(request.query);

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

		if (!ridesPermission['resources']?.agency_ids?.length) {
			Logger.issue({
				context: {
					action: 'getBatch',
					feature: 'operationalStops',
					request,
				},
				level: 'info',
				messageOrError: 'No agency_ids found in permissions',
			});
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// Run the query

		const result = await getOperationalStopsBatch({
			...parsedQuery,
			agency_ids: parsedQuery.agency_ids?.filter(id => allowAllAgencies || ridesPermission['resources'].agency_ids.includes(id)) ?? [],
		});

		//
		// Send the response

		reply.send({
			data: result,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	//
}
