/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { buildSamsMatch, sams, samsAnalysisExportAggregationPipeline, samsApexVersionsAggregationPipeline, samsBatchAggregationPipeline, samsBatchBaseAggregationPipeline, samsByIdAggregationPipeline, samsByIdsListViewAggregationPipeline } from '@tmlmobilidade/interfaces';
import { ActionsOf, type GetSamsBatchQuery, GetSamsBatchQuerySchema, Permission, PermissionCatalog, type Sam, type SamAnalysis, type SamListItem, withTimelineMonthGapFlags } from '@tmlmobilidade/types';

/* * */

/**
 * A type for the batch list item.
 */
type SamBatchListItem = SamListItem;
type SamBaseListItem = Omit<SamListItem, 'timeline_summary'>;

interface SamTimelineSummaryListItem {
	_id: number
	timeline_summary: null | Sam['timeline_summary']
}

type SamTimelineSummarySourceRow = Pick<SamBatchListItem, '_id' | 'timeline_summary'>;

function toNonNegativeInt(value: unknown): number {
	if (typeof value === 'number' && Number.isFinite(value))
		return Math.max(0, Math.trunc(value));
	if (value != null && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => unknown }).toNumber === 'function') {
		const converted = Number((value as { toNumber: () => unknown }).toNumber());
		if (Number.isFinite(converted))
			return Math.max(0, Math.trunc(converted));
	}
	const converted = Number(value);
	if (!Number.isFinite(converted))
		return 0;
	return Math.max(0, Math.trunc(converted));
}

function normalizeTimelineSummaryApi(timelineSummary: null | Sam['timeline_summary']): Sam['timeline_summary'] {
	const safeSummary = timelineSummary ?? { months: [] };
	return {
		months: (safeSummary.months ?? []).map((month) => {
			const successfulCount = toNonNegativeInt(month.successful_count);
			const failedCount = toNonNegativeInt(month.failed_count);
			return {
				failed_count: failedCount,
				month: String((month as { month?: unknown }).month ?? (month as { key?: unknown }).key ?? ''),
				successful_count: successfulCount,
			};
		}),
	} as unknown as Sam['timeline_summary'];
}

function applyTimelineGapFlagsDetail(sam: Sam & { __analysis?: SamAnalysis[] }): Sam {
	const merged = { ...sam };
	delete (merged as { __analysis?: SamAnalysis[] }).__analysis;
	const rest = merged as Sam;
	return {
		...rest,
		timeline_summary: withTimelineMonthGapFlags(rest.timeline_summary, rest.analysis ?? [], rest.seen_first_at, rest.seen_last_at),
	};
}

/* * */

export class SamsController {
	/**
	 * Resolves the timeline summary rows for the given IDs.
	 * @param request The Fastify request object.
	 * @param ids The IDs of the SAMs to resolve the timeline summary for.
	 * @param reply The Fastify reply object.
	 */
	static async getTimelineSummaryByIds(request: FastifyRequest, reply: FastifyReply<SamTimelineSummaryListItem[]>) {
		const numericIds = SamsController.parseNumericIds(request.query['ids']?.split(',') ?? []);
		return SamsController.resolveTimelineSummaryRows(request, numericIds, reply);
	}

	/**
	 * Resolves the timeline summary rows for the given IDs.
	 * @param request The Fastify request object.
	 * @param ids The IDs of the SAMs to resolve the timeline summary for.
	 * @param reply The Fastify reply object.
	 */
	static async postTimelineSummaryByIds(
		request: FastifyRequest<{ Body: { ids?: number[] } }>,
		reply: FastifyReply<SamTimelineSummaryListItem[]>,
	) {
		const numericIds = (request.body?.ids ?? []).filter(id => Number.isInteger(id));
		return SamsController.resolveTimelineSummaryRows(request, numericIds, reply);
	}

	/**
	 * Resolves the timeline summary rows for the given IDs.
	 * @param request The Fastify request object.
	 * @param ids The IDs of the SAMs to resolve the timeline summary for.
	 * @param reply The Fastify reply object.
	 */
	static async resolveTimelineSummaryRows(request: FastifyRequest, ids: number[], reply: FastifyReply<SamTimelineSummaryListItem[]>) {
		const samsPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read);

		if (!samsPermission) {
			return reply.status(HTTP_STATUS.FORBIDDEN).send({ data: null, error: 'Insufficient permissions.', statusCode: HTTP_STATUS.FORBIDDEN });
		}

		if (ids.length === 0) {
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const agencyIds = (samsPermission as Permission & { resources?: { agency_ids?: string[] } }).resources?.agency_ids;
		const restrictByAgency = Array.isArray(agencyIds) && agencyIds.length > 0;
		const allowAllAgencies = !restrictByAgency || (agencyIds?.includes(PermissionCatalog.ALLOW_ALL_FLAG) ?? false);

		const timelineRows = (await sams.aggregate(
			samsByIdsListViewAggregationPipeline({
				agencyIds,
				ids,
				restrictByAgency: !allowAllAgencies && Boolean(agencyIds?.length),
			}),
		)) as SamTimelineSummarySourceRow[];

		const timelineBySam = timelineRows.map(item => ({
			_id: item._id,
			timeline_summary: normalizeTimelineSummaryApi(item.timeline_summary),
		}));

		return reply.send({ data: timelineBySam, error: null, statusCode: HTTP_STATUS.OK });
	}

	private static parseNumericIds(rawIds: string[]): number[] {
		return rawIds
			.map(part => part.trim())
			.filter(Boolean)
			.map(Number)
			.filter(id => Number.isInteger(id));
	}

	/**
	 * Returns distinct `latest_apex_version` values from SAM documents (list filter).
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
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

	/**
	 * Returns the base list of SAMs.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatchBase(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamBaseListItem[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const matchAnd = buildSamsMatch(parsedQuery);

		const pipeline = samsBatchBaseAggregationPipeline({ matchAnd });
		const allSams = (await sams.aggregate(pipeline)) as SamBaseListItem[];

		return reply.send({
			data: allSams,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Returns the full list of SAMs.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamBatchListItem[]>) {
		const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
		const matchAnd = buildSamsMatch(parsedQuery);

		const pipeline = samsBatchAggregationPipeline({ matchAnd });
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

		const samRows = await sams.aggregate(samsByIdAggregationPipeline(Number(id))) as Array<Sam & { __analysis?: SamAnalysis[] }>;
		const sam = samRows[0];

		if (!sam) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({ data: null, error: 'SAM not found.', statusCode: HTTP_STATUS.NOT_FOUND });
		}

		//
		// Return the SAM

		return reply.send({ data: applyTimelineGapFlagsDetail(sam), error: null, statusCode: HTTP_STATUS.OK });
	}

	/* * */

	static async getSamByIds<S extends Permission['scope']>(request: FastifyRequest, reply: FastifyReply<SamBatchListItem[]>, scope: S, action: ActionsOf<S>) {
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

		const foundSamsByIds = (await sams.aggregate(
			samsByIdsListViewAggregationPipeline({
				agencyIds,
				ids: numericIds,
				restrictByAgency: !allowAllAgencies && Boolean(agencyIds?.length),
			}),
		)) as SamBatchListItem[];

		return reply.send({ data: foundSamsByIds, error: null, statusCode: HTTP_STATUS.OK });
	}
}
