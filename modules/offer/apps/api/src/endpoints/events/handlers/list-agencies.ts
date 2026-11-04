/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type EventsAgencyItem, EventsAgencyItemSchema } from '@tmlmobilidade/go-offer-pckg-types';

/**
 * Returns agency labels for Events filters and forms.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<EventsAgencyItem[]>) {
	//

	//
	// Fetch and validate the lookup response.

	const foundAgencies = await goDb.core.agencies.findMany();

	const validatedAgencies = EventsAgencyItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
