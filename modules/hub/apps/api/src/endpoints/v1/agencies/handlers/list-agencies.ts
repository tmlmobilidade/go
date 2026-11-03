/* * */

import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubV1ApiAgency, HubV1ApiAgencySchema } from '@tmlmobilidade/go-types-hub';

/** Return published agencies belonging to this organization. */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiAgency[]>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	const foundAgencies = await goDb.core.agencies.findMany({ _id: { $in: agencyIds } });

	const parsedAgencies: HubV1ApiAgency[] = [];
	for (const agency of foundAgencies) {
		try {
			console.log(agency);
			parsedAgencies.push(HubV1ApiAgencySchema.parse(agency));
		} catch (error) {
			console.error(`Failed to parse agency ${agency._id}: ${error}`);
		}
	}

	return sendSuccessApiResponse(reply, parsedAgencies);
}
