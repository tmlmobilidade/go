/* * */

import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiAgency } from '@tmlmobilidade/go-types-hub';

/** Return published agencies belonging to this organization. */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiAgency[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const cached = await cacheDb.getNew<HubV1ApiAgency[]>('hub:v1:agencies:json');
	return sendSuccessApiResponse(reply, (cached?.data ?? []).filter(item => agencyIds.includes(item._id)), { generated_at: cached?.timestamp, max_age: '1h' });
}
