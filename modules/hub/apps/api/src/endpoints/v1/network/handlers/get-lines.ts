/* * */

import { oldestCacheTimestamp, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';

/** Return organization-scoped published data. */
export async function getLinesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiLine[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await readAgencyCache<HubV1ApiLine[]>(agencyIds, `network:lines`);
	const data = entries.flatMap(entry => entry.data);

	//
	// Return the merged data

	return sendSuccessApiResponse(reply, data, { generated_at: oldestCacheTimestamp(entries), max_age: '1h' });
}
