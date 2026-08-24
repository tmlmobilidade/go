/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UsersAgencyItem, UsersAgencyItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all users agencies.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<UsersAgencyItem[]>) {
	//

	const foundAgencies = await goDb.core.agencies.findMany();

	if (!foundAgencies?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No users agencies found',
			status_code: '404',
		});
	}

	const validatedAgencies = UsersAgencyItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
