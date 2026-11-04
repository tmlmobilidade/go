/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type FaresAgencyItem, FaresAgencyItemSchema } from '@tmlmobilidade/go-offer-pckg-types';

/**
 * Returns agency labels for Fares filters and forms.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<FaresAgencyItem[]>) {
	//

	//
	// Fetch and validate the lookup response.

	const foundAgencies = await goDb.core.agencies.findMany();

	const validatedAgencies = FaresAgencyItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
