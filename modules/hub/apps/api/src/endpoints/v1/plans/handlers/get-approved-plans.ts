/* * */

import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiPlan } from '@tmlmobilidade/go-types-hub';

/** Return published plans belonging to this organization. */
export async function getApprovedPlansHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiPlan[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const raw = await cacheDb.get('hub:v1:plans:approved:json');
	const data: HubV1ApiPlan[] = raw ? JSON.parse(raw) : [];
	return sendSuccessApiResponse(reply, data.filter(item => agencyIds.includes(item.agency_id)), { max_age: '5m' });
}
