/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event, EventSchema, type UpdateEventDto, UpdateEventSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing event by ID
 * @param request Fastify request containing event ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateEventHandler(request: FastifyRequest<{ Body: UpdateEventDto, Params: { id: string } }>, reply: FastifyReply<Event>) {
	//

	//
	// Validate the client contract before permissions or assignment side effects.

	const validatedEvent = UpdateEventSchema.safeParse(request.body);

	if (!validatedEvent.success) {
		return sendErrorApiResponse(reply, {
			error: validatedEvent.error.message,
			status_code: '400',
		});
	}

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

	const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.update);

	//
	// If no permission found, deny access

	if (!userEventPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update events',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this event's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.events.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: eventData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this event. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Authorize every submitted replacement agency before any writes.

	if (validatedEvent.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.events.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: validatedEvent.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update these agencies.',
			status_code: '403',
		});
	}

	//
	// Update the event

	const updatedEvent = await goDb.offer.events.updateById(eventData._id, { ...validatedEvent.data, updated_by: request.me._id });

	//
	// Send the updated event data as the response

	return sendSuccessApiResponse(reply, EventSchema.parse(updatedEvent));

	//
}
