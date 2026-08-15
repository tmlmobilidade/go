/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type ControllerRidesListFilters, type ControllerRidesListItem, getControllerRidesList } from '@tmlmobilidade/go-controller-pckg-queries';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRides(request: FastifyRequest<{ Body: ControllerRidesListFilters }>, reply: FastifyReply<ControllerRidesListItem[]>) {
	//

	//
	// Apply permission filters to the request body
	const body = request.body;
	body.agency_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.rides.actions.analysis_read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.rides.scope,
		values: body.agency_ids,
	});

	//
	// Fetch the rides data by query
	// and send it back to the client

	const result = await getControllerRidesList(request.body);

	return sendSuccessApiResponse(reply, result);
}
