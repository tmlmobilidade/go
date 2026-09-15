/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of an Annotation by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function lockAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Get the annotation from the database

	const foundAnnotation = await goDb.offer.annotations.findById(request.params.id);

	if (!foundAnnotation) {
		return sendErrorApiResponse(reply, {
			error: `Annotation with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission for all the annotation agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: foundAnnotation.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock annotation. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Toggle the lock status of the annotation

	const updatedAnnotation = await goDb.offer.annotations.updateById(foundAnnotation._id, { is_locked: !foundAnnotation.is_locked });

	return sendSuccessApiResponse(reply, updatedAnnotation);
}
