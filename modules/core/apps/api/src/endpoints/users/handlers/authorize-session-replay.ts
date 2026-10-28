/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';

import { authorizeUserSessionReplay } from '../utils/session-replay.js';
import { getSessionReplayResponse } from '../utils/session-replay-state.js';

/* * */

export async function authorizeSessionReplayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<UserSessionReplayResponse>) {
	reply.header('Cache-Control', 'no-store');
	const authorization = await authorizeUserSessionReplay(request.params.id, request.me._id);
	return sendSuccessApiResponse(reply, getSessionReplayResponse(request.params.id, authorization));
}
