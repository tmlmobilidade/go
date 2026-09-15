/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of an Event by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function lockEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Event>) {
	//

	//
	// Get the event from the database

	const foundEvent = await goDb.offer.events.findById(request.params.id);

	if (!foundEvent) {
		return sendErrorApiResponse(reply, {
			error: `Event with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission for all the event agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.events.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: foundEvent.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock event. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Toggle the lock status of the event

	const updatedEvent = await goDb.offer.events.updateById(foundEvent._id, { is_locked: !foundEvent.is_locked });

	return sendSuccessApiResponse(reply, updatedEvent);
}
