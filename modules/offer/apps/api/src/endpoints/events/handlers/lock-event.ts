/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of an event by ID
 * @param request Fastify request containing event ID in params
 * @param reply Fastify reply
 */
export async function lockEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Event>) {
	//

	//
	// Get the Event from the database

	const eventData = await goDb.offer.events.findById(request.params.id);

	if (!eventData) {
		return sendErrorApiResponse(reply, {
			error: 'Event not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for events for the current user.

	const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.lock);

	//
	// If no permission found, deny access

	if (!userEventPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock events',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this event's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.events.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: eventData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock event. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	// If authorized, toggle the lock status of the event
	await goDb.offer.events.updateOne({ _id: request.params.id }, { is_locked: !eventData.is_locked, updated_by: request.me._id });
	const foundEvent = await goDb.offer.events.findById(request.params.id, { projection: { associated_patterns: 0 } });
	if (!foundEvent) {
		return sendErrorApiResponse(reply, {
			error: 'Event not found',
			status_code: '404',
		});
	}
	return sendSuccessApiResponse(reply, foundEvent);

	//
}
