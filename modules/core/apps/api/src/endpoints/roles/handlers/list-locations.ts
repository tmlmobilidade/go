/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';

/**
 * Returns the location tree available for roles permissions.
 * @param request The request object
 * @param reply The reply object
 */
export async function listLocationsHandler(request: FastifyRequest, reply: FastifyReply<LocationTreeNode[]>) {
	return sendSuccessApiResponse(reply, await locationsProvider.findTree());
}
