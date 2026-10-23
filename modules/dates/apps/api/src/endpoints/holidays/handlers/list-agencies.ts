/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HolidaysAgencyItem, HolidaysAgencyItemSchema } from '@tmlmobilidade/go-dates-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns agency labels for Holidays filters and forms.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<HolidaysAgencyItem[]>) {
	//

	//
	// Fetch and validate the lookup response.

	const foundAgencies = await goDb.core.agencies.findMany();

	const validatedAgencies = HolidaysAgencyItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
