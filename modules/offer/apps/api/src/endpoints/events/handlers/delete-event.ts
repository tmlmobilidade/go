/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an event by ID
 * @param request Fastify request containing event ID in params
 * @param reply Fastify reply
 */
export async function deleteEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const { id } = request.params;
	const event = await goDb.offer.events.findById(id);

	if (!event) {
		return sendErrorApiResponse(reply, {
			error: 'Event not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for events for the current user.

	const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.delete);

	//
	// If no permission found, deny access

	if (!userEventPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete events',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this event's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.events.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: event.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this event. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//

	await goDb.offer.events.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
