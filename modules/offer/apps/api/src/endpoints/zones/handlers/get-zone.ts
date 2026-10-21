/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { ZONES_READ_PERMISSION_CHECKS } from '../permission-checks.js';

/**
 * Retrieves a single zone by ID
 * @param request Fastify request containing zone ID in params
 * @param reply Fastify reply
 */
export async function getZoneHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Zone>) {
	//

	//
	// Get the Zone from the database

	const zoneData = await goDb.offer.zones.findById(request.params.id);

	if (!zoneData) {
		return sendErrorApiResponse(reply, {
			error: 'Zone not found',
			status_code: '404',
		});
	}

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: ZONES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	const canReadZone = agencyAccess.allowAll || zoneData.agency_ids.some(agencyId => agencyAccess.values.includes(agencyId));

	if (!canReadZone) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this zone',
			status_code: '403',
		});
	}

	//
	// Fetch the zone data

	return sendSuccessApiResponse(reply, zoneData);

	//
}
