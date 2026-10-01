/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a Stop by ID.
 * @param request The request object containing the stop ID in the params
 * @param reply The reply object
 */
export async function lockStopHandler(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Get the stop from the database

	const foundStop = await goDb.infrastructure.stops.findById(request.params.id);

	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: 'Stop not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to run this action
	// for the agencies referenced by the flags of this stop

	if (foundStop.flags.length !== 0) {
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: foundStop.flags.flatMap(flag => flag.agency_ids),
		});

		if (!hasPermission) {
			return sendErrorApiResponse(reply, {
				error: 'You are not authorized to lock or unlock this stop',
				status_code: '403',
			});
		}
	}

	//
	// Toggle the lock status of the stop

	await goDb.infrastructure.stops.updateById(request.params.id, { is_locked: !foundStop.is_locked });

	return sendSuccessApiResponse(reply, foundStop);
}
