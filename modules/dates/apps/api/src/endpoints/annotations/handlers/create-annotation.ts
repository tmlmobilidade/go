/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-offer';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';

/**
 * Inserts a new annotation into the database.
 * @param request The request object containing the annotation data in the body.
 * @param reply The reply object used to send the response.
 */
export async function createAnnotationHandler(request: FastifyRequest<{ Body: Omit<Annotation, '_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> }>, reply: FastifyReply<Annotation>) {
	//

	//
	// Check if the user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = request.body.agency_ids.every((agencyId) => {
		return hasPermissionResource(request.permissions, {
			requiredPermission: {
				action: 'create',
				scope: 'annotations',
			},
			requiredValue: agencyId,
			resourceKey: 'agency_ids',
		});
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
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, insertResult);
}
