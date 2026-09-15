/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new Annotation in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function createAnnotationHandler(request: FastifyRequest<{ Body: CreateAnnotationDto }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Validate the request body

	const validatedAnnotation = CreateAnnotationSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedAnnotation.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAnnotation.error.message,
			status_code: '400',
		});
	}

	//
	// Check if the user has permission for all the specified agencies

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
	// Insert the new annotation in the database

	const createdAnnotation = await goDb.offer.annotations.insertOne(validatedAnnotation.data);

	return sendSuccessApiResponse(reply, createdAnnotation);
}
