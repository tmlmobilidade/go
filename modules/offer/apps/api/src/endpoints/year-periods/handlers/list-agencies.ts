/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PeriodsAgencyItem, PeriodsAgencyItemSchema } from '@tmlmobilidade/go-offer-pckg-types';

/**
 * Returns agency labels for Periods filters and forms.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<PeriodsAgencyItem[]>) {
	//

	//
	// Fetch and validate the lookup response.

	const foundAgencies = await goDb.core.agencies.findMany();

	const validatedAgencies = PeriodsAgencyItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
