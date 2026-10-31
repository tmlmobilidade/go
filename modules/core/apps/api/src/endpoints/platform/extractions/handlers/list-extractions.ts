/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';

import { getUserExtractions } from '../utils/get-user-extractions.js';

/**
 * List the extractions for the current user.
 * @param request The request object
 * @param reply The reply object
 */
export async function listExtractionsHandler(request: FastifyRequest, reply: FastifyReply<Extraction[]>) {
	//

	//
	// Retrieve extractions for the current user and environment

	const foundExtractions = await getUserExtractions(request.me._id);

	sendSuccessApiResponse(reply, foundExtractions ?? []);
}
