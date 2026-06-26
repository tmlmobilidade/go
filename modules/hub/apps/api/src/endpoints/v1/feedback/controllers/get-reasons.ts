/* * */

import { PublicFeedbackReasons } from '@/endpoints/v1/feedback/feedback-reasons.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export async function getReasons(request: FastifyRequest, reply: FastifyReply<typeof PublicFeedbackReasons>) {
	return reply.send({
		data: PublicFeedbackReasons,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
