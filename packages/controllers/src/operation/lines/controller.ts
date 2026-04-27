/* * */

import { getOperationalLinesBatch } from '@/operation/lines/batch.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type ActionsOf, type GetOperationalLinesBatchQuery, type OperationalLine, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

export class OperationalLinesSharedController {
	//

	/**
	 * Gets a batch of Operation Lines built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch<S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetOperationalLinesBatchQuery }>, reply: FastifyReply<OperationalLine[]>, scope: S, action: ActionsOf<S>) {
		//

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

		if (!ridesPermission['resources']?.agency_ids?.length) return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });

		const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// Run the query

		const result = await getOperationalLinesBatch({
			...request.query,
			agency_ids: request.query.agency_ids?.filter(id => allowAllAgencies || ridesPermission['resources'].agency_ids.includes(id)) ?? [],
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
