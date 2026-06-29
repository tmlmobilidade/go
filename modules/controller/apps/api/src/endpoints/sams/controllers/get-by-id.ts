/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams, samsByIdAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type Sam, type SamAnalysis, withTimelineMonthGapFlags } from '@tmlmobilidade/types';

/* * */

function applyTimelineGapFlagsDetail(sam: Sam & { __analysis?: SamAnalysis[] }): Sam {
	const merged = { ...sam };
	delete (merged as { __analysis?: SamAnalysis[] }).__analysis;
	const rest = merged as Sam;
	return {
		...rest,
		timeline_summary: withTimelineMonthGapFlags(rest.timeline_summary, rest.analysis ?? [], rest.seen_first_at, rest.seen_last_at),
	};
}

/**
 * Returns a SAM by ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getById(request: FastifyRequest, reply: FastifyReply<Sam>) {
	//
	// Validate the request parameters

	const { id } = request.params as { id: string };

	if (!id || isNaN(Number(id))) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing id parameter.');
	}

	//
	// Fetch the SAM from the database

	const samRows = await sams.aggregate(samsByIdAggregationPipeline(Number(id))) as Array<Sam & { __analysis?: SamAnalysis[] }>;
	const sam = samRows[0];

	if (!sam) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'SAM not found.');
	}

	//
	// Return the SAM

	return reply.send({ data: applyTimelineGapFlagsDetail(sam), error: null, statusCode: HTTP_STATUS.OK });
}
