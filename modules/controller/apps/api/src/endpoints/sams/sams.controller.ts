/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type AggregationPipeline, sams } from '@tmlmobilidade/interfaces';
import { type Sam } from '@tmlmobilidade/types';

/* * */

/** Max SAM rows per response */
const SAM_LIST_LIMIT = 100;
/** Last |n| `analysis` elements per SAM (`$slice` second arg must be present; negative = tail). */
const ANALYSIS_LIST_TAIL = 400;

export class SamsController {
	/**
	 * Newest SAMs first (capped), with `analysis` limited to the last {@link ANALYSIS_LIST_TAIL} entries per chip.
	 */
	static async getBatch(_request: FastifyRequest, reply: FastifyReply<Sam[]>) {
		const pipeline = [
			{ $sort: { created_at: -1 } },
			{ $limit: SAM_LIST_LIMIT },
			{
				$project: {
					_id: 1,
					agency_id: 1,
					analysis: { $slice: [{ $ifNull: ['$analysis', []] }, -ANALYSIS_LIST_TAIL] },
					seen_first_at: 1,
					seen_last_at: 1,
					system_status: 1,
					transactions_expected: 1,
					transactions_found: 1,
					transactions_missing: 1,
				},
			},
		] as AggregationPipeline<Sam>;

		const allSams = (await sams.aggregate(pipeline)) as Sam[];

		return reply.send({
			data: allSams,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}
}
