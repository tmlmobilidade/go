/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Annotation } from '@tmlmobilidade/go-types-offer';

/**
 * Inserts a new annotation into the database.
 * @param request The request object containing the annotation data in the body.
 * @param reply The reply object used to send the response.
 */
export async function createAnnotationHandler(request: FastifyRequest<{ Body: Omit<Annotation, '_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> }>, reply: FastifyReply<Annotation>) {
	//

	const insertResult = await goDb.offer.annotations.insertOne({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, insertResult);
}
