/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type AggregationPipeline, sams } from '@tmlmobilidade/interfaces';
import { type GetSamsBatchQuery, GetSamsBatchQuerySchema, PermissionCatalog, type Sam } from '@tmlmobilidade/types';

/* * */

/** Max SAM rows per response */
const SAM_LIST_LIMIT = 100;
/** Last |n| `analysis` elements per SAM (`$slice` second arg must be present; negative = tail). */
const ANALYSIS_LIST_TAIL = 400;

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class SamsController {
	/**
	 * Newest SAMs first (capped), with `analysis` limited to the last {@link ANALYSIS_LIST_TAIL} entries per chip.
	 */
	static async getBatch(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});

		const matchAnd: Record<string, unknown>[] = [];

		const agencyIdsForMatch = parsedQuery.agency_ids.filter(
			id => id !== PermissionCatalog.ALLOW_ALL_FLAG,
		);
		if (agencyIdsForMatch.length > 0) {
			matchAnd.push({ agency_id: { $in: agencyIdsForMatch } });
		}

		const searchRaw = parsedQuery.search?.trim() ?? '';
		if (searchRaw.length > 0) {
			const escaped = escapeRegex(searchRaw);
			matchAnd.push({
				$or: [
					{ $expr: { $regexMatch: { input: { $toString: '$_id' }, options: 'i', regex: escaped } } },
					{ agency_id: { $options: 'i', $regex: escaped } },
				],
			});
		}

		if (parsedQuery.system_status?.length) {
			matchAnd.push({ system_status: { $in: parsedQuery.system_status } });
		}

		const pipeline = [
			...(matchAnd.length > 0 ? [{ $match: { $and: matchAnd } }] : []),
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
	 * Returns a SAM by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getById(request: FastifyRequest, reply: FastifyReply<Sam>) {
		//
		// Validate the request parameters

		const { id } = request.params as { id: string };

		if (!id || isNaN(Number(id))) {
			return reply.status(HTTP_STATUS.BAD_REQUEST).send({ data: null, error: 'Missing id parameter.', statusCode: HTTP_STATUS.BAD_REQUEST });
		}

		//
		// Fetch the SAM from the database

		const sam = await sams.findById(Number(id));

		if (!sam) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({ data: null, error: 'SAM not found.', statusCode: HTTP_STATUS.NOT_FOUND });
		}

		//
		// Return the SAM

		return reply.send({ data: sam, error: null, statusCode: HTTP_STATUS.OK });
	}
}
