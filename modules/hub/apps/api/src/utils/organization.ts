/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubV1ApiOrganization, HubV1ApiOrganizationSchema } from '@tmlmobilidade/go-types-hub';

const organizations = new WeakMap<FastifyRequest, HubV1ApiOrganization>();

/** Resolve only organizations whose data is publicly enabled. */
export async function resolveOrganization(request: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply<unknown>) {
	const organization = await goDb.core.organizations.findOne({ '_id': request.params.organizationId, 'open_data.enabled': true });
	if (!organization) return sendErrorApiResponse(reply, { error: 'Organization not found', status_code: '404' });
	organizations.set(request, HubV1ApiOrganizationSchema.parse(organization));
}

/** Get the organization resolved by the route hook. */
export function getOrganization(request: FastifyRequest): HubV1ApiOrganization {
	const organization = organizations.get(request);
	if (!organization) throw new Error('Organization was not resolved');
	return organization;
}
