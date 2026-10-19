/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
	}

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: ZONES_READ_PERMISSION_CHECKS,
		permissions: request.permissions,
		resource_key: 'agency_ids',
	});

	const canReadZone = agencyAccess.allowAll || zoneData.agency_ids.some(agencyId => agencyAccess.values.includes(agencyId));

	if (!canReadZone) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this zone');
	}

	//
	// Fetch the zone data

	return reply.send({
		data: zoneData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
