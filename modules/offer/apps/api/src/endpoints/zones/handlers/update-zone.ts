/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateZoneDto, UpdateZoneSchema, type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing zone by ID
 * @param request Fastify request containing zone ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateZoneHandler(request: FastifyRequest<{ Body: UpdateZoneDto, Params: { id: string } }>, reply: FastifyReply<Zone>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedZone = UpdateZoneSchema.safeParse(request.body);

	if (!validatedZone.success) {
		return sendErrorApiResponse(reply, {
			error: validatedZone.error.message,
			status_code: '400',
		});
	}

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

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.update);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update zones',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this zone's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: zoneData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this zone. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Check permission for every newly assigned agency as well.

	if (validatedZone.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: validatedZone.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update zones for these agencies.',
			status_code: '403',
		});
	}

	//
	// Update the zone with parsed client fields and the authenticated updater.

	const updatedZone = await goDb.offer.zones.updateById(zoneData._id, {
		...validatedZone.data,
		updated_by: request.me._id,
	});

	//
	// Send the updated zone data as the response

	return sendSuccessApiResponse(reply, updatedZone);

	//
}
