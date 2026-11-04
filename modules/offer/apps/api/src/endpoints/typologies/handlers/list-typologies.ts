/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Typology } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { TYPOLOGIES_READ_PERMISSION_CHECKS } from '../permission-checks.js';

/**
 * Retrieves all typologies.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listTypologiesHandler(request: FastifyRequest, reply: FastifyReply<Typology[]>) {
	//

	//
	// Build database query filters based on user permissions

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: TYPOLOGIES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!agencyAccess.allowAll && !agencyAccess.values.length) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read typologies',
			status_code: '403',
		});
	}

	const queryFilters: Filter<Typology> = agencyAccess.allowAll ? {} : { agency_ids: { $in: agencyAccess.values } };

	//
	// Fetch typologies based on query filters

	const allTypologies = await goDb.offer.typologies.findMany(queryFilters, { sort: { created_at: -1 } });

	return sendSuccessApiResponse(reply, allTypologies);
	//
}
