/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AgenciesListItem, AgenciesListItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all Agencies sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<AgenciesListItem[]>) {
	//

	const foundAgencies = await goDb.core.agencies.findMany();

	if (!foundAgencies?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No agencies found',
			status_code: '404',
		});
	}

	const validatedAgencies = AgenciesListItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
