/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an annotation by ID
 * @param request Fastify request containing annotation ID in params
 * @param reply Fastify reply
 */
export async function deleteAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	const { id } = request.params;
	const annotation = await goDb.offer.annotations.findById(id);

	if (!annotation) {
		return sendErrorApiResponse(reply, {
			error: 'Annotation not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.delete);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete annotations',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this annotation's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: annotation.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this annotation. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//

	await goDb.offer.annotations.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
