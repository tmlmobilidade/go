/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Typology, type UpdateTypologyDto, UpdateTypologySchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing typology by ID
 * @param request Fastify request containing typology ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateTypologyHandler(request: FastifyRequest<{ Body: UpdateTypologyDto, Params: { id: string } }>, reply: FastifyReply<Typology>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedTypology = UpdateTypologySchema.safeParse(request.body);

	if (!validatedTypology.success) {
		return sendErrorApiResponse(reply, {
			error: validatedTypology.error.message,
			status_code: '400',
		});
	}

	//
	// Get the Typology from the database

	const typologyData = await goDb.offer.typologies.findById(request.params.id);

	if (!typologyData) {
		return sendErrorApiResponse(reply, {
			error: 'Typology not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for typologies for the current user.

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.update);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update typologies',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this typology's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: typologyData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this typology. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Check permission for every newly assigned agency as well.

	if (validatedTypology.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: validatedTypology.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update typologies for these agencies.',
			status_code: '403',
		});
	}

	//
	// Update the typology with parsed client fields and the authenticated updater.

	const updatedTypology = await goDb.offer.typologies.updateById(typologyData._id, {
		...validatedTypology.data,
		updated_by: request.me._id,
	});

	//
	// Send the updated typology data as the response

	return sendSuccessApiResponse(reply, updatedTypology);

	//
}
