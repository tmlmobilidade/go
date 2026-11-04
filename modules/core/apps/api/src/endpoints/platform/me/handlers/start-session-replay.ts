/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UserSessionReplayResponse, UserSessionReplayStartRequestSchema } from '@tmlmobilidade/go-types-core';

import { startUserSessionReplay } from '../../../users/utils/session-replay.js';
import { getSessionReplayResponse } from '../../../users/utils/session-replay-state.js';

/* * */

export async function startSessionReplayHandler(request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply<UserSessionReplayResponse>) {
	reply.header('Cache-Control', 'no-store');
	const input = UserSessionReplayStartRequestSchema.safeParse(request.body);
	if (!input.success) return sendErrorApiResponse(reply, { error: 'A valid activation_id is required; user and timestamps cannot be supplied', status_code: '400' });
	const authorization = await startUserSessionReplay(request.me._id, input.data.activation_id);
	return sendSuccessApiResponse(reply, getSessionReplayResponse(request.me._id, authorization));
}
