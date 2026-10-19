/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Fare } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { FARES_READ_PERMISSION_CHECKS } from '../permission-checks.js';

/**
 * Retrieves all fares.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listFaresHandler(request: FastifyRequest, reply: FastifyReply<Fare[]>) {
	//

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: FARES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!agencyAccess.allowAll && !agencyAccess.values.length) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read fares');
	}

	const queryFilters: Filter<Fare> = agencyAccess.allowAll ? {} : { agency_ids: { $in: agencyAccess.values } };

	//
	// Fetch fares based on query filters

	const allFares = await goDb.offer.fares.findMany(queryFilters, { sort: { created_at: -1 } });

	return reply.send({ data: allFares, error: null, statusCode: HTTP_STATUS.OK });
	//
}
