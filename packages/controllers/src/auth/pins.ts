import type { User_UNSAFE } from '@tmlmobilidade/types';

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type AggregationPipeline, users } from '@tmlmobilidade/interfaces';

/* * */

interface AllPinsAggregateResult {
	data: string[]
}

/* * */

export class PinsSharedController {
	//

	/**
	 * Returns all pins.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<string[]>) {
		const pipeline: AggregationPipeline<User_UNSAFE> = [
			{ $match: { pins: { $ne: [] } } },
			{
				$addFields: {
					flatPins: {
						$reduce: {
							in: { $concatArrays: ['$$value', '$$this'] },
							initialValue: [],
							input: '$pins',
						},
					},
				},
			},
			{ $unwind: '$flatPins' },
			{ $group: { _id: null, data: { $push: '$flatPins' } } },
		];

		const rows = await users.aggregate(pipeline);
		const data = (rows[0] as unknown as AllPinsAggregateResult | undefined)?.data ?? [];

		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}
}
