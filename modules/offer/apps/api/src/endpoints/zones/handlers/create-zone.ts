/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateZoneDto, CreateZoneSchema, type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new zone.
 * @param request Fastify request containing zone data
 * @param reply Fastify reply
 */
export async function createZoneHandler(request: FastifyRequest<{ Body: CreateZoneDto }>, reply: FastifyReply<Zone>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedZone = CreateZoneSchema.safeParse(request.body);

	if (!validatedZone.success) {
		return sendErrorApiResponse(reply, {
			error: validatedZone.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for zones for the current user.

	const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.create);

	//
	// If no permission found, deny access

	if (!userZonePermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create zones',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.zones.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: validatedZone.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create zones for these agencies. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Create the new zone

	const newZone = await goDb.offer.zones.insertOne({
		...validatedZone.data,
		created_by: request.me._id,
		geojson: validatedZone.data.geojson ?? { features: [], type: 'FeatureCollection' },
		is_locked: false,
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, newZone);

	//
}
