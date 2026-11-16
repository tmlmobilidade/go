/* * */

import { oldestCacheTimestamp, readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiAgency } from '@tmlmobilidade/go-types-hub';

/** Return published agencies belonging to this organization. */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiAgency[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const entries = await readAgencyCache<HubV1ApiAgency[]>(agencyIds, 'agencies:json');
	const data = entries.flatMap(entry => entry.data);

	return sendSuccessApiResponse(reply, data, { generated_at: oldestCacheTimestamp(entries), max_age: '5m' });
}
