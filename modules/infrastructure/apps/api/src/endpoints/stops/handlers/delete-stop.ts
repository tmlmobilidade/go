/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the deleted status of a stop by ID.
 * @param request Fastify request containing stop ID in params
 * @param reply Fastify reply
 */
export async function deleteStopHandler(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
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

	if (foundStop.flags.length !== 0) {
		// Check if the user has permission to run this action
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: foundStop.flags.flatMap(flag => flag.agency_ids),
		});

		if (!hasPermission) {
			return sendErrorApiResponse(reply, {
				error: 'You are not authorized to delete this stop',
				status_code: '403',
			});
		}
	}

	//
	// If authorized, toggle the deleted status of the stop

	const updatedStop = await goDb.infrastructure.stops.updateById(request.params.id, { is_deleted: !foundStop.is_deleted });

	if (!updatedStop) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to delete stop',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, updatedStop);
}
