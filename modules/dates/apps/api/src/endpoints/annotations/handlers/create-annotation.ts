/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Inserts a new annotation into the database.
 * @param request The request object containing the annotation data in the body.
 * @param reply The reply object used to send the response.
 */
export async function createAnnotationHandler(request: FastifyRequest<{ Body: CreateAnnotationDto }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Validate the shared client contract before applying permissions or server audit fields.

	const validatedAnnotation = CreateAnnotationSchema.safeParse(request.body);

	if (!validatedAnnotation.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAnnotation.error.message,
			status_code: '400',
		});
	}

	//
	// Check if the user has permission for ALL the specified agencies

	const userAnnotationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.create);

	if (!userAnnotationPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create annotations',
			status_code: '403',
		});
	}

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.annotations.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: validatedAnnotation.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'User not authorized to create annotations for at least one of the specified agencies.',
			status_code: '403',
		});
	}

	//
	// Insert the new annotation

	const insertResult = await goDb.offer.annotations.insertOne({
		...validatedAnnotation.data,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, insertResult);
}
