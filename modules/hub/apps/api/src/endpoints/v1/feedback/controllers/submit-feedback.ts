/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { feedback } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type PublicFeedback, PublicFeedbackSchema } from '@tmlmobilidade/types';

/* * */

export async function submitFeedback(request: FastifyRequest, reply: FastifyReply<PublicFeedback>) {
	const parsedFeedback = PublicFeedbackSchema.safeParse(request.body);

	if (!parsedFeedback.success) {
		return reply.code(HTTP_STATUS.BAD_REQUEST).send({
			data: null,
			error: parsedFeedback.error.message,
			statusCode: HTTP_STATUS.BAD_REQUEST,
		});
	}

	await feedback.insert('JSONEachRow', [parsedFeedback.data]);

	return reply.code(HTTP_STATUS.CREATED).send({
		data: parsedFeedback.data,
		error: null,
		statusCode: HTTP_STATUS.CREATED,
	});
}
