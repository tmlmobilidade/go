/* * */

import { createPatternStopsSearchFilter, PATTERN_STOPS_SEARCH_PROJECTION } from '@/utils/pattern-stops-search.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsStopSearchItem, type PatternsStopSearchQuery, PatternsStopSearchQuerySchema } from '@tmlmobilidade/go-offer-pckg-types';

/**
 * Searches Stops by ID or name and returns a bounded list of compact results.
 * @param request The request object
 * @param reply The reply object
 */
export async function listPatternsStopsHandler(request: FastifyRequest<{ Querystring: PatternsStopSearchQuery }>, reply: FastifyReply<PatternsStopSearchItem[]>) {
	//

	const parsedQuery = PatternsStopSearchQuerySchema.safeParse(request.query);
	if (!parsedQuery.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, parsedQuery.error.message);
	}

	const foundStops = await goDb.infrastructure.stops.findMany(
		createPatternStopsSearchFilter(parsedQuery.data.query),
		{
			limit: parsedQuery.data.limit,
			projection: PATTERN_STOPS_SEARCH_PROJECTION,
		},
	);

	return sendSuccessApiResponse(reply, foundStops);
}
