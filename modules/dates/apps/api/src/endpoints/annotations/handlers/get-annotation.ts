/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single annotation by ID
 * @param request Fastify request containing annotation ID in params
 * @param reply Fastify reply
 */
export async function getAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Get the Annotation from the database

	const annotationData = await goDb.offer.annotations.findById(request.params.id);

	if (!annotationData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Annotation not found');
	}

	//
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.read);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read annotations');
	}

	//
	// Validate that user has permission for at least one of this annotation's agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.annotations.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: annotationData.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this annotation');
	}

	//
	// Fetch the annotation data

	return reply.send({
		data: annotationData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
