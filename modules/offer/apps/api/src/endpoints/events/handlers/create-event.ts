/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateEventDto, CreateEventSchema, type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

//

/**
 * Creates a new event.
 * @param request Fastify request containing event data
 * @param reply Fastify reply
 */
export async function createEventHandler(request: FastifyRequest<{ Body: CreateEventDto }>, reply: FastifyReply<Event>) {
	//

	//
	// Validate the client contract before permissions or assignment side effects.

	const validatedEvent = CreateEventSchema.safeParse(request.body);

	if (!validatedEvent.success) {
		return sendErrorApiResponse(reply, {
			error: validatedEvent.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for events for the current user.

	const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.create);

	//
	// If no permission found, deny access

	if (!userEventPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create events',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.events.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: validatedEvent.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create events for these agencies. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Create the new event

	const newEvent = await goDb.offer.events.insertOne({
		...validatedEvent.data,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, newEvent);

	//
}
