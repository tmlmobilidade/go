/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation, type UpdateAnnotationDto, UpdateAnnotationSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an Annotation in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAnnotationHandler(request: FastifyRequest<{ Body: UpdateAnnotationDto, Params: { id: string } }>, reply: FastifyReply<Annotation>) {
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
		action: PermissionCatalog.all.annotations.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: foundAnnotation.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this annotation. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Validate the request body

	const validatedAnnotation = UpdateAnnotationSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedAnnotation.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAnnotation.error.message,
			status_code: '400',
		});
	}

	//
	// Update the annotation in the database

	const updatedAnnotation = await goDb.offer.annotations.updateById(foundAnnotation._id, validatedAnnotation.data);

	return sendSuccessApiResponse(reply, updatedAnnotation);
}
