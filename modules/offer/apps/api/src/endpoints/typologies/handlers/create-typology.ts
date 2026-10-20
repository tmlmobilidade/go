/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateTypologyDto, CreateTypologySchema, type Typology } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new typology.
 * @param request Fastify request containing typology data
 * @param reply Fastify reply
 */
export async function createTypologyHandler(request: FastifyRequest<{ Body: CreateTypologyDto }>, reply: FastifyReply<Typology>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedTypology = CreateTypologySchema.safeParse(request.body);

	if (!validatedTypology.success) {
		return sendErrorApiResponse(reply, {
			error: validatedTypology.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for typologies for the current user.

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.create);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create typologies',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: validatedTypology.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create typologies for these agencies. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Create the new typology

	const newTypology = await goDb.offer.typologies.insertOne({
		color: validatedTypology.data.color ?? '#000000',
		default_onboard_fare_ids: validatedTypology.data.default_onboard_fare_ids ?? [],
		default_prepaid_fare_id: validatedTypology.data.default_prepaid_fare_id ?? null,
		is_locked: false,
		text_color: validatedTypology.data.text_color ?? '#FFFFFF',
		...validatedTypology.data,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, newTypology);

	//
}
