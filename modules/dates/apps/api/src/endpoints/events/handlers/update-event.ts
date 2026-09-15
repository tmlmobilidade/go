/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event, type UpdateEventDto, UpdateEventSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an Event in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateEventHandler(request: FastifyRequest<{ Body: UpdateEventDto, Params: { id: string } }>, reply: FastifyReply<Event>) {
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
		action: PermissionCatalog.all.events.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: foundEvent.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this event. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Validate the request body

	const validatedEvent = UpdateEventSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedEvent.success) {
		return sendErrorApiResponse(reply, {
			error: validatedEvent.error.message,
			status_code: '400',
		});
	}

	//
	// Update the event in the database

	const updatedEvent = await goDb.offer.events.updateById(foundEvent._id, validatedEvent.data);

	return sendSuccessApiResponse(reply, updatedEvent);
}
