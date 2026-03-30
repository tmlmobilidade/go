/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type AggregationPipeline, sams } from '@tmlmobilidade/interfaces';
import { type Sam, SamAnalysis } from '@tmlmobilidade/types';

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

	/**
	 * Returns the analysis for a SAM.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getAnalysis(request: FastifyRequest, reply: FastifyReply<SamAnalysis[]>) {
		//
		// Validate the request parameters

		const { id } = request.params as { id: number };

		if (!id) {
			return reply.status(HTTP_STATUS.BAD_REQUEST).send({ data: null, error: 'Missing id parameter.', statusCode: HTTP_STATUS.BAD_REQUEST });
		}

		//
		// Fetch the SAM from the database

		const sam = await sams.findById(id);

		if (!sam) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({ data: null, error: 'SAM not found.', statusCode: HTTP_STATUS.NOT_FOUND });
		}

		//
		// Return the analysis for the SAM

		return reply.send({ data: sam.analysis ?? [], error: null, statusCode: HTTP_STATUS.OK });
	}
}
