/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an Annotation from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
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
		action: PermissionCatalog.all.annotations.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: foundAnnotation.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this annotation. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Delete the annotation from the database

	await goDb.offer.annotations.deleteById(foundAnnotation._id);

	return sendSuccessApiResponse(reply, undefined);
}
