/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { buildSamsMatch, sams, SAMS_ANALYSIS_LIST_TAIL, samsAnalysisExportAggregationPipeline, samsApexVersionsAggregationPipeline, samsBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { ActionsOf, type GetSamsBatchQuery, GetSamsBatchQuerySchema, Permission, PermissionCatalog, type Sam } from '@tmlmobilidade/types';

/* * */

/**
 * A type for the batch list item.
 */
type SamBatchListItem = Omit<Sam, 'analysis'> & {
	analysis: Array<{
		end_time: null | number
		first_transaction_id: null | string
		start_time: null | number
	}>
};

/* * */

export class SamsController {
	/**
	 * Returns distinct `latest_apex_version` values from SAM documents (list filter).
	 */
	static async getApexVersions(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const matchAnd = buildSamsMatch(parsedQuery, { includeApexVersionFilter: false });

		const pipeline = samsApexVersionsAggregationPipeline({ matchAnd });

		const rows = (await sams.aggregate(pipeline)) as Array<{ _id: unknown }>;
		return reply.send({
			data: rows.map(item => String(item._id)),
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	static async getBatch(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamBatchListItem[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const pagedQuery = parsedQuery as GetSamsBatchQuery & { limit?: number, offset?: number };
		const pageOffset = pagedQuery.offset ?? 0;
		const matchAnd = buildSamsMatch(parsedQuery);

		const pipeline = samsBatchAggregationPipeline({
			analysisListTail: SAMS_ANALYSIS_LIST_TAIL,
			matchAnd,
			pageLimit: parsedQuery.limit,
			pageOffset,
		});

		const allSams = (await sams.aggregate(pipeline)) as SamBatchListItem[];

		return reply.send({
			data: allSams,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Returns one row per SAM analysis record for export (same aggregation as the file-export worker).
	 * Query mirrors {@link GetSamsBatchQuery}; optional `ids` (comma-separated SAM `_id`) ANDs with those filters.
	 */
	static async getExportData(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const matchAnd = buildSamsMatch(parsedQuery);

		const numericIds = (request.query['ids']?.split(',') ?? [])
			.map(part => part.trim())
			.filter(Boolean)
			.map(Number)
			.filter(id => Number.isInteger(id));

		if (numericIds.length === 0 && matchAnd.length === 0) {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const pipeline = samsAnalysisExportAggregationPipeline({
			matchAnd: matchAnd.length > 0 ? matchAnd : undefined,
			samIds: numericIds.length > 0 ? numericIds : undefined,
		});

		const rows = (await sams.aggregate(pipeline)) as Sam[];
		return reply.send({ data: rows, error: null, statusCode: HTTP_STATUS.OK });
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

	/* * */

	static async getSamByIds<S extends Permission['scope']>(request: FastifyRequest, reply: FastifyReply<Sam[]>, scope: S, action: ActionsOf<S>) {
		//
		// Resolve SAMs for stored favorite ids. `SamsPermission` has no `resources` today — treat missing
		// `agency_ids` like list batch default (no agency restriction). When resources exist, match rides.

		void scope;
		void action;

		const samsPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read);

		if (!samsPermission) {
			return reply.status(HTTP_STATUS.FORBIDDEN).send({ data: null, error: 'Insufficient permissions.', statusCode: HTTP_STATUS.FORBIDDEN });
		}

		const agencyIds = (samsPermission as Permission & { resources?: { agency_ids?: string[] } }).resources?.agency_ids;
		const restrictByAgency = Array.isArray(agencyIds) && agencyIds.length > 0;
		const allowAllAgencies = !restrictByAgency || (agencyIds?.includes(PermissionCatalog.ALLOW_ALL_FLAG) ?? false);

		const numericIds = (request.query['ids']?.split(',') ?? [])
			.map(part => part.trim())
			.filter(Boolean)
			.map(Number)
			.filter(id => Number.isInteger(id));

		if (numericIds.length === 0) {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const foundSamsByIds = await sams.findMany({
			_id: { $in: numericIds },
			...(!allowAllAgencies && agencyIds?.length ? { agency_id: { $in: agencyIds } } : {}),
		});

		return reply.send({ data: foundSamsByIds.map(sam => sam), error: null, statusCode: HTTP_STATUS.OK });
	}
}
