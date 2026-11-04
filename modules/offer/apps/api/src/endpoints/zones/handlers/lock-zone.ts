/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a zone by ID
 * @param request Fastify request containing zone ID in params
 * @param reply Fastify reply
 */
export async function lockZoneHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Zone>) {
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

	//
	// Get the resource permissions for zones for the current user.

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.lock);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock zones',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this zone's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: zoneData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock zone. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	// If authorized, toggle the lock status of the zone
	await goDb.offer.zones.updateOne({ _id: request.params.id }, { is_locked: !zoneData.is_locked, updated_by: request.me._id });
	const foundZone = await goDb.offer.zones.findById(request.params.id);
	if (!foundZone) {
		return sendErrorApiResponse(reply, {
			error: 'Zone not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundZone);

	//
}
