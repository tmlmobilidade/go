/* * */

import { PublicFeedbackLineReasonValues } from '@/endpoints/v1/feedback/feedback-reasons/line/line-reasons.js';
import { PublicFeedbackStopReasonValues } from '@/endpoints/v1/feedback/feedback-reasons/stop/stop-reasons.js';
import { feedback } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type PublicFeedback, PublicFeedbackSchema } from '@tmlmobilidade/types';

/* * */

type PublicFeedbackReasonOptions = [
	{
		entity_type: 'line'
		values: typeof PublicFeedbackLineReasonValues
	},
	{
		entity_type: 'stop'
		values: typeof PublicFeedbackStopReasonValues
	},
];

/* * */

export class FeedbackController {
	//

	/**
	 * Returns the public feedback reasons grouped by entity type.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getReasons(request: FastifyRequest, reply: FastifyReply<PublicFeedbackReasonOptions>) {
		return reply.send({
			data: [
				{
					entity_type: 'line',
					values: PublicFeedbackLineReasonValues,
				},
				{
					entity_type: 'stop',
					values: PublicFeedbackStopReasonValues,
				},
			],
			error: null,
			statusCode: 200,
		});
	}

	/**
	 * Validates and returns a public feedback submission.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async submit(request: FastifyRequest, reply: FastifyReply<PublicFeedback>) {
		// Validate request body before accepting the submission.
		const parsedFeedback = PublicFeedbackSchema.safeParse(request.body);

		if (!parsedFeedback.success) {
			return reply.code(400).send({
				data: null,
				error: parsedFeedback.error.message,
				statusCode: 400,
			});
		}

		await feedback.insert('JSONEachRow', [parsedFeedback.data]);

		return reply.code(201).send({
			data: parsedFeedback.data,
			error: null,
			statusCode: 201,
		});
	}

	//
}
