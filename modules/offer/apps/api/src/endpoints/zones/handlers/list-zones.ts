/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { ZONES_READ_PERMISSION_CHECKS } from '../permission-checks.js';

/**
 * Retrieves all zones.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listZonesHandler(request: FastifyRequest, reply: FastifyReply<Zone[]>) {
	//

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: ZONES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	if (!agencyAccess.allowAll && !agencyAccess.values.length) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read zones',
			status_code: '403',
		});
	}

	const queryFilters: Filter<Zone> = agencyAccess.allowAll ? {} : { agency_ids: { $in: agencyAccess.values } };

	//
	// Fetch zones based on query filters

	const allZones = await goDb.offer.zones.findMany(queryFilters, { sort: { created_at: -1 } });

	return sendSuccessApiResponse(reply, allZones);
	//
}
