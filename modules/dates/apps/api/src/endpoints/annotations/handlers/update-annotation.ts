/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation, type UpdateAnnotationDto, UpdateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing annotation by ID
 * @param request Fastify request containing annotation ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateAnnotationHandler(request: FastifyRequest<{ Body: UpdateAnnotationDto, Params: { id: string } }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedAnnotation = UpdateAnnotationSchema.safeParse(request.body);

	if (!validatedAnnotation.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAnnotation.error.message,
			status_code: '400',
		});
	}

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

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.update);

	//
	// If no permission found, deny access

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update annotations',
			status_code: '403',
		});
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
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this annotation. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Check permission for every newly assigned agency as well.

	if (validatedAnnotation.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: validatedAnnotation.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update annotations for these agencies.',
			status_code: '403',
		});
	}

	//
	// Update the annotation with parsed client fields and the authenticated updater.

	const updatedAnnotation = await goDb.offer.annotations.updateById(annotationData._id, {
		...validatedAnnotation.data,
		updated_by: request.me._id,
	});

	//
	// Send the updated annotation data as the response

	return sendSuccessApiResponse(reply, updatedAnnotation);

	//
}
