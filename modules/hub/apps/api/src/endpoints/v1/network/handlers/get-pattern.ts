/* * */

import { oldestCacheTimestamp, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';

/** Return organization-scoped published data. */
export async function getPatternHandler(request: FastifyRequest<{ Params: { patternId: string } }>, reply: FastifyReply<HubV1ApiPattern[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await readAgencyCache<HubV1ApiPattern[]>(agencyIds, `network:patterns:${request.params.patternId}`);
	const data = entries.flatMap(entry => entry.data);
	if (!entries.length) return sendErrorApiResponse(reply, { error: 'Resource not found', status_code: '404' });

	//
	// Return the merged data

	return sendSuccessApiResponse(reply, data, { generated_at: oldestCacheTimestamp(entries), max_age: '1h' });
}
