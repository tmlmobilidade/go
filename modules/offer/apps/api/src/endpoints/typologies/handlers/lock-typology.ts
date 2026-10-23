/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Typology } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a typology by ID
 * @param request Fastify request containing typology ID in params
 * @param reply Fastify reply
 */
export async function lockTypologyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Typology>) {
	//

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

	const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.lock);

	//
	// If no permission found, deny access

	if (!userTypologyPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock typologies',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this typology's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.typologies.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: typologyData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock typology. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	// If authorized, toggle the lock status of the typology
	await goDb.offer.typologies.updateOne({ _id: request.params.id }, { is_locked: !typologyData.is_locked, updated_by: request.me._id });
	const foundTypology = await goDb.offer.typologies.findById(request.params.id);
	if (!foundTypology) {
		return sendErrorApiResponse(reply, {
			error: 'Typology not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundTypology);

	//
}
