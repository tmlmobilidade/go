import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiOrganization } from '@tmlmobilidade/go-types-hub';

/** Retrieves the public organization directory from the published cache. */
export async function listOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiOrganization[]>) {
	//

	//
	// Retrieve the published organization directory

	const cachedData = await cacheDb.getNew<HubV1ApiOrganization[]>('hub:v1:organizations:json');
	return sendSuccessApiResponse(reply, cachedData?.data ?? [], {
		generated_at: cachedData?.timestamp,
		max_age: '1h',
	});
}
