/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';

/**
 * Reload an extraction for the current user.
 * @param request The request object
 * @param reply The reply object
 */
export async function reloadExtractionHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Extraction[]>) {
	//

	//
	// Retrieve extraction for the current user

	const foundExtraction = await goDb.core.extractions.findOne({
		_id: request.params.id,
		created_by: request.me._id,
	});

	if (!foundExtraction) {
		return sendErrorApiResponse(reply, {
			error: 'Extraction not found or not owned by the current user',
			status_code: '404',
		});
	}

	//
	// Set processing status to waiting

	await goDb.core.extractions.updateOne({ _id: request.params.id }, { processing_status: 'waiting' });

	//
	// Retrieve all extractions for the current user

	const foundExtractions = await goDb.core.extractions.findMany({ created_by: request.me._id });

	return sendSuccessApiResponse(reply, foundExtractions ?? []);
}
