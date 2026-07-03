/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams, samsByIdsListViewAggregationPipeline } from '@tmlmobilidade/interfaces';
import { Permission, PermissionCatalog, type Sam, type SamListItem } from '@tmlmobilidade/types';

/**
 * A type for the batch list item.
 */
type SamBatchListItem = SamListItem;

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

/**
 * Resolves the timeline summary rows for the given IDs.
 * @param request The Fastify request object.
 * @param ids The IDs of the SAMs to resolve the timeline summary for.
 * @param reply The Fastify reply object.
 */
export async function resolveTimelineSummaryRows(request: FastifyRequest, ids: number[], reply: FastifyReply<SamTimelineSummaryListItem[]>) {
	const samsPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read);

	if (!samsPermission) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'Insufficient permissions.');
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
