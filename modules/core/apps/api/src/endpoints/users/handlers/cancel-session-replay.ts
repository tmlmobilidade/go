/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UserSessionReplayResponse } from '@tmlmobilidade/go-types-core';

import { cancelUserSessionReplay } from '../utils/session-replay.js';
import { getSessionReplayResponse } from '../utils/session-replay-state.js';

/* * */

export async function cancelSessionReplayHandler(request: FastifyRequest<{ Params: { activationId: string, id: string } }>, reply: FastifyReply<UserSessionReplayResponse>) {
	reply.header('Cache-Control', 'no-store');
	await cancelUserSessionReplay(request.params.id, request.params.activationId);
	return sendSuccessApiResponse(reply, getSessionReplayResponse(request.params.id, null));
}
