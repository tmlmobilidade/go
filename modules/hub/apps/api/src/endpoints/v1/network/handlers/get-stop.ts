/* * */

import { mergeStops, oldestCacheTimestamp, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

/** Return organization-scoped published data. */
export async function getStopHandler(request: FastifyRequest<{ Params: { stopId: string } }>, reply: FastifyReply<HubV1ApiStop>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await readAgencyCache<HubV1ApiStop>(agencyIds, `network:stops:${request.params.stopId}`);
	const data = entries.flatMap(entry => entry.data);
	const merged = mergeStops(data);
	if (!entries.length) return sendErrorApiResponse(reply, { error: 'Resource not found', status_code: '404' });

	//
	// Return the merged data

	return sendSuccessApiResponse(reply, merged[0], { generated_at: oldestCacheTimestamp(entries), max_age: '1h' });
}
