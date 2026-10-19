/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
	}

	//
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.delete);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete annotations');
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
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this annotation. You must have permission for all agencies involved.');
	}

	//

	await goDb.offer.annotations.deleteById(id);

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
