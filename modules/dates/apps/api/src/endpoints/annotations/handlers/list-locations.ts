/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type LocationTreeNode, LocationTreeNodeSchema } from '@tmlmobilidade/go-types-locations';

/**
 * Returns authoritative administrative locations for annotation geographic scope.
 * @param request The authenticated request.
 * @param reply The reply object.
 */
export async function listLocationsHandler(request: FastifyRequest, reply: FastifyReply<LocationTreeNode[]>) {
	return sendSuccessApiResponse(reply, LocationTreeNodeSchema.array().parse(await locationsProvider.findAdministrativeTree()));
}
