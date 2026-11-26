/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type MeUser } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { isSessionReplayAuthorized } from '../../../users/utils/session-replay-state.js';

/**
 * Get the current user from the session token.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMeUserHandler(request: FastifyRequest, reply: FastifyReply<MeUser>) {
	//

	reply.header('Cache-Control', 'no-store');

	//
	// Reply with the already populated MeUser data from the request.

	const authorization = request.me.session_replay;
	if (authorization && !isSessionReplayAuthorized(authorization, Dates.now('utc').unix_milliseconds)) {
		return sendSuccessApiResponse(reply, { ...request.me, session_replay: null });
	}

	return sendSuccessApiResponse(reply, request.me);
}
