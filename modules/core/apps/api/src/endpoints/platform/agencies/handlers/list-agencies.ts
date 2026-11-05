/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AgencyReference, AgencyReferenceSchema } from '@tmlmobilidade/go-types-core';

/** Returns basic agency labels for authenticated cross-module lookups. */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<AgencyReference[]>) {
	//

	//
	// Read only lookup fields; management details are not part of this contract

	const projection = Object.fromEntries(Object.keys(AgencyReferenceSchema.shape).map(key => [key, 1]));
	const agencies = await goDb.core.agencies.findMany({}, { projection });
	const references = AgencyReferenceSchema.array().parse(agencies);

	return sendSuccessApiResponse(reply, references);
}
