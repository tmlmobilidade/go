/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation, type UpdateAnnotationDto } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing annotation by ID
 * @param request Fastify request containing annotation ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateAnnotationHandler(request: FastifyRequest<{ Body: UpdateAnnotationDto, Params: { id: string } }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Get the Annotation from the database

	const annotationData = await goDb.offer.annotations.findById(request.params.id);

	if (!annotationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
	}

	//
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.update);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update annotations');
	}

	//
	// Validate that user has permission for ALL of this annotation's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: annotationData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this annotation. You must have permission for all agencies involved.');
	}

	//
	// Update the annotation

	const updatedAnnotation = await goDb.offer.annotations.updateById(annotationData._id, request.body);

	//
	// Send the updated annotation data as the response

	reply.send({
		data: updatedAnnotation,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
