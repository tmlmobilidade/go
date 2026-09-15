/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME } from '@tmlmobilidade/go-providers-auth';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';

/**
 * Deletes an Extraction of the current user.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteExtractionHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Extraction[]>) {
	//

	//
	// Extract the session token from authentication cookie

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	if (!sessionToken) {
		return sendErrorApiResponse(reply, {
			error: 'Session token not found',
			status_code: '401',
		});
	}

	//
	// Delete the extraction from the database

	const deleteResult = await goDb.core.extractions.deleteOne({
		_id: request.params.id,
		created_by: request.me._id,
	});

	if (!deleteResult.deletedCount) {
		return sendErrorApiResponse(reply, {
			error: 'Extraction not found or not owned by the current user',
			status_code: '404',
		});
	}

	//
	// Retrieve extractions for the current user

	const foundExtractions = await goDb.core.extractions.findMany({ created_by: request.me._id });

	return sendSuccessApiResponse(reply, foundExtractions ?? []);
}
