/* * */

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
 * Posts the timeline summary rows for the given IDs.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function postTimelineSummaryByIds(request: FastifyRequest<{ Body: { ids?: number[] } }>, reply: FastifyReply<SamTimelineSummaryListItem[]>) {
	const numericIds = (request.body.ids ?? []).filter(id => Number.isInteger(id));
	if (numericIds.length === 0) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ids parameter.');
	return resolveTimelineSummaryRows(request, numericIds, reply);
}
