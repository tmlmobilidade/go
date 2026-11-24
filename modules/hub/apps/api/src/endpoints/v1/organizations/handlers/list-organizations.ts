/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubV1ApiOrganization, HubV1ApiOrganizationSchema } from '@tmlmobilidade/go-types-hub';

/** List publicly enabled organizations. */
export async function listOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiOrganization[]>) {
	//

	//
	// Retrieve the published data

	const organizations = await goDb.core.organizations.findMany({ 'open_data.enabled': true });
	return sendSuccessApiResponse(reply, HubV1ApiOrganizationSchema.array().parse(organizations), { max_age: '1h' });
}
