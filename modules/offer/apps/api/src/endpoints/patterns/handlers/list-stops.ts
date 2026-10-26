/* * */

import { createPatternStopsSearchFilter, PATTERN_STOPS_SEARCH_PROJECTION } from '@/utils/pattern-stops-search.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsStopSearchItem, PatternsStopSearchItemSchema, type PatternsStopSearchQuery, PatternsStopSearchQuerySchema } from '@tmlmobilidade/go-offer-pckg-types';

/**
 * Searches Stops by ID or name and returns a bounded list of compact results.
 * @param request The request object
 * @param reply The reply object
 */
export async function listPatternsStopsHandler(request: FastifyRequest<{ Querystring: PatternsStopSearchQuery }>, reply: FastifyReply<PatternsStopSearchItem[]>) {
	//

	const parsedQuery = PatternsStopSearchQuerySchema.safeParse(request.query);
	if (!parsedQuery.success) {
		return sendErrorApiResponse(reply, { error: parsedQuery.error.message, status_code: '400' });
	}

	const foundStops = await goDb.infrastructure.stops.findMany(
		createPatternStopsSearchFilter(parsedQuery.data.query),
		{
			limit: parsedQuery.data.limit,
			projection: PATTERN_STOPS_SEARCH_PROJECTION,
		},
	);

	return sendSuccessApiResponse(reply, PatternsStopSearchItemSchema.array().parse(foundStops));
}
