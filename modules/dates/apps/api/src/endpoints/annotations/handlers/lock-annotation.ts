/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of an annotation by ID
 * @param request Fastify request containing annotation ID in params
 * @param reply Fastify reply
 */
export async function lockAnnotationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Annotation>) {
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

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.lock);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock annotations',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this annotation's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: annotationData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock annotation. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	// If authorized, toggle the lock status of the annotation
	await goDb.offer.annotations.updateOne({ _id: request.params.id }, { is_locked: !annotationData.is_locked, updated_by: request.me._id });
	const foundAnnotation = await goDb.offer.annotations.findById(request.params.id);
	if (!foundAnnotation) {
		return sendErrorApiResponse(reply, {
			error: 'Annotation not found',
			status_code: '404',
		});
	}
	return sendSuccessApiResponse(reply, foundAnnotation);

	//
}
