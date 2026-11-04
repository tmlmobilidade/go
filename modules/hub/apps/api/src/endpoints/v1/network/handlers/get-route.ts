/* * */

import { oldestCacheTimestamp, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';

/** Return organization-scoped published data. */
export async function getRouteHandler(request: FastifyRequest<{ Params: { routeId: string } }>, reply: FastifyReply<HubV1ApiRoute>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await readAgencyCache<HubV1ApiRoute>(agencyIds, `network:routes:${request.params.routeId}`);
	const data = entries.flatMap(entry => entry.data);
	if (!entries.length) return sendErrorApiResponse(reply, { error: 'Resource not found', status_code: '404' });

	//
	// Return the merged data

	return sendSuccessApiResponse(reply, data[0], { generated_at: oldestCacheTimestamp(entries), max_age: '1h' });
}
