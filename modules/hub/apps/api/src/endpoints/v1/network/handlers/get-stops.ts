/* * */

import { mergeStops, oldestCacheTimestamp, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

/** Return organization-scoped published data. */
export async function getStopsHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiStop[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await readAgencyCache<HubV1ApiStop[]>(agencyIds, `network:stops`);
	const data = entries.flatMap(entry => entry.data);
	const merged = mergeStops(data);

	//
	// Return the merged data

	return sendSuccessApiResponse(reply, merged, { generated_at: oldestCacheTimestamp(entries), max_age: '1h' });
}
