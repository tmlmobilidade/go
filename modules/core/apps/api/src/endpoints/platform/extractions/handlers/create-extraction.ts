/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Extraction, type ExtractionCreate, ExtractionCreateSchema } from '@tmlmobilidade/go-types-extractions';
import { getCurrentEnvironment } from '@tmlmobilidade/go-types-shared';

import { getUserExtractions } from '../utils/get-user-extractions.js';

/**
 * Create a new extraction for the current user.
 * @param request The request object
 * @param reply The reply object
 */
export async function createExtractionHandler(request: FastifyRequest<{ Body: ExtractionCreate }>, reply: FastifyReply<Extraction[]>) {
	//

	//
	// Validate the request body

	const validatedRequestBodyResult = ExtractionCreateSchema.safeParse(request.body);

	if (!validatedRequestBodyResult.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequestBodyResult.error,
			status_code: '400',
		});
	}

	//
	// Insert a new extraction into the database

	await goDb.core.extractions.insertOne({
		...validatedRequestBodyResult.data,
		attachment_id: null,
		created_by: request.me._id,
		downloaded_at: null,
		is_locked: false,
		processing_status: 'waiting',
		retries: 0,
		source_environment: getCurrentEnvironment(),
	});

	//
	// Retrieve extractions again for the current user and environment
	// so the frontend is able to immediately mutate the extractions list

	const foundExtractions = await getUserExtractions(request.me._id);

	return sendSuccessApiResponse(reply, foundExtractions ?? []);
}
