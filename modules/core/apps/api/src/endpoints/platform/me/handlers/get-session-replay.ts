/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';

import { getUserSessionReplay } from '../../../users/utils/session-replay.js';
import { getSessionReplayResponse } from '../../../users/utils/session-replay-state.js';

/* * */

export async function getSessionReplayHandler(request: FastifyRequest, reply: FastifyReply<UserSessionReplayResponse>) {
	reply.header('Cache-Control', 'no-store');
	const authorization = await getUserSessionReplay(request.me._id);
	return sendSuccessApiResponse(reply, getSessionReplayResponse(request.me._id, authorization));
}
