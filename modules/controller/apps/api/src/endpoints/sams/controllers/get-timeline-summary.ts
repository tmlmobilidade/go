/* * */

import { parseNumericIds } from '@/endpoints/sams/utils/parse-numeric-ids.js';
import { resolveTimelineSummaryRows } from '@/endpoints/sams/utils/resolve-timeline-summary-rows.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Sam } from '@tmlmobilidade/types';

/* * */

interface SamTimelineSummaryListItem {
	_id: number
	timeline_summary: null | Sam['timeline_summary']
}

/**
 * Resolves the timeline summary rows for the given IDs.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getTimelineSummaryByIds(request: FastifyRequest<{ Querystring: { ids: string } }>, reply: FastifyReply<SamTimelineSummaryListItem[]>) {
	const numericIds = parseNumericIds(request.query.ids?.split(',') ?? []);
	if (numericIds.length === 0) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ids parameter.');
	return resolveTimelineSummaryRows(request, numericIds, reply);
}
