/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams, SAMS_ANALYSIS_LIST_TAIL, samsApexVersionsAggregationPipeline, samsBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type GetSamsBatchQuery, GetSamsBatchQuerySchema, PermissionCatalog, type Sam } from '@tmlmobilidade/types';

/* * */

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const RESERVED_QUERY_FIELDS = new Set(['agency_ids', 'limit', 'offset', 'search']);
const RANGE_QUERY_FIELDS = {
	seen_first_at: { field: 'seen_first_at', operator: '$gte' },
	seen_last_at: { field: 'seen_last_at', operator: '$lte' },
} as const;

function buildSamsMatchAnd(
	parsedQuery: GetSamsBatchQuery,
	options: { includeApexVersionFilter?: boolean } = {},
): Record<string, unknown>[] {
	const { includeApexVersionFilter = true } = options;
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

	for (const [key, value] of Object.entries(parsedQuery)) {
		if (RESERVED_QUERY_FIELDS.has(key) || value === undefined || value === null || value === '')
			continue;
		if (!includeApexVersionFilter && key === 'latest_apex_version')
			continue;

		if (key in RANGE_QUERY_FIELDS) {
			const rangeKey = key as keyof typeof RANGE_QUERY_FIELDS;
			const rangeConfig = RANGE_QUERY_FIELDS[rangeKey];
			matchAnd.push({ [rangeConfig.field]: { [rangeConfig.operator]: value } });
			continue;
		}

		if (Array.isArray(value)) {
			if (value.length > 0) {
				if (key === 'latest_apex_version') {
					matchAnd.push({
						$or: [
							{ latest_apex_version: { $in: value } },
							{ 'analysis.apex_version': { $in: value } },
						],
					});
					continue;
				}
				matchAnd.push({ [key]: { $in: value } });
			}
			continue;
		}

		matchAnd.push({ [key]: value });
	}

	return matchAnd;
}

export class SamsController {
	/**
	 * Newest SAMs first (capped), with `analysis` limited to the last {@link SAMS_ANALYSIS_LIST_TAIL} entries per chip.
	 */
	static async getApexVersions(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const matchAnd = buildSamsMatchAnd(parsedQuery, { includeApexVersionFilter: false });

		const pipeline = samsApexVersionsAggregationPipeline({ matchAnd });

		const rows = (await sams.aggregate(pipeline)) as Array<{ _id: unknown }>;
		return reply.send({
			data: rows.map(item => String(item._id)),
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	static async getBatch(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const pagedQuery = parsedQuery as GetSamsBatchQuery & { limit?: number, offset?: number };
		const pageLimit = pagedQuery.limit ?? 500;
		const pageOffset = pagedQuery.offset ?? 0;
		const matchAnd = buildSamsMatchAnd(parsedQuery);

		const pipeline = samsBatchAggregationPipeline({
			analysisListTail: SAMS_ANALYSIS_LIST_TAIL,
			matchAnd,
			pageLimit,
			pageOffset,
		});

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
