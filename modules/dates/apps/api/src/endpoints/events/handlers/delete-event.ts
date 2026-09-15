/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an Event from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
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
		action: PermissionCatalog.all.events.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: foundEvent.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this event. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Delete the event from the database

	await goDb.offer.events.deleteById(foundEvent._id);

	return sendSuccessApiResponse(reply, undefined);
}
