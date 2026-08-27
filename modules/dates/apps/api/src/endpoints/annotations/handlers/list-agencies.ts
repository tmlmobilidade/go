/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AnnotationsAgencyItem, AnnotationsAgencyItemSchema } from '@tmlmobilidade/go-dates-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all annotations agencies.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<AnnotationsAgencyItem[]>) {
	//

	const foundAgencies = await goDb.core.agencies.findMany();

	if (!foundAgencies?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No annotations agencies found',
			status_code: '404',
		});
	}

	const validatedAgencies = AnnotationsAgencyItemSchema.array().parse(foundAgencies);

	return sendSuccessApiResponse(reply, validatedAgencies);
}
