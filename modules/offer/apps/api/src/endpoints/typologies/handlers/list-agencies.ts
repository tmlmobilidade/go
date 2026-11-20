/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type TypologiesAgencyItem, TypologiesAgencyItemSchema } from '@tmlmobilidade/go-offer-pckg-types';

/**
 * Returns agency labels for Typologies filters and forms.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<TypologiesAgencyItem[]>) {
	//

	//
	// Fetch agencies and validate each lookup item independently.

	const foundAgencies = await goDb.core.agencies.findMany();

	const validatedAgencies = foundAgencies.flatMap((agency) => {
		const result = TypologiesAgencyItemSchema.safeParse(agency);
		if (result.success) return [result.data];

		request.log.warn({ agency_id: agency._id, issues: result.error.issues }, 'Skipping invalid agency in lookup response');
		return [];
	});

	return sendSuccessApiResponse(reply, validatedAgencies);
}
