/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns a Stop by ID.
 * @param request The request object containing the stop ID in the params
 * @param reply The reply object
 */
export async function getStopHandler(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Get the stop from the database

	const foundStop = await goDb.infrastructure.stops.findById(request.params.id);

	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: `Can not find stop with ID ${request.params.id}`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to read this stop

	const hasPermission = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.read,
		permissions: request.permissions,
		resource_key: 'municipality_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: foundStop.municipality_id,
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'User does not have permission to read this stop',
			status_code: '401',
		});
	}

	return sendSuccessApiResponse(reply, foundStop);
}
