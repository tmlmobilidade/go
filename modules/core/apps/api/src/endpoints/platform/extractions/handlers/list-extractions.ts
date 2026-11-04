/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { AUTH_SESSION_COOKIE_NAME } from '@tmlmobilidade/go-providers-auth';
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
	// Extract the session token from authentication cookie

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	if (!sessionToken) {
		return sendErrorApiResponse(reply, {
			error: 'Session token not found',
			status_code: '401',
		});
	}

	//
	// Retrieve extractions for the current user and environment

	const foundExtractions = await getUserExtractions(request.me._id);

	sendSuccessApiResponse(reply, foundExtractions ?? []);
}
