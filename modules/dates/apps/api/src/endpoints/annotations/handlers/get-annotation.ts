/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
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
		return sendErrorApiResponse(reply, {
			error: 'Annotation not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for annotations for the current user.

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.read);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read annotations',
			status_code: '403',
		});
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
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this annotation',
			status_code: '403',
		});
	}

	//
	// Fetch the annotation data

	return sendSuccessApiResponse(reply, annotationData);

	//
}
