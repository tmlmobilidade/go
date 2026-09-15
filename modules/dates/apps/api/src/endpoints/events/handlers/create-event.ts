/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateEventDto, CreateEventSchema, type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new Event in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function createEventHandler(request: FastifyRequest<{ Body: CreateEventDto }>, reply: FastifyReply<Event>) {
	//

	//
	// Validate the request body

	const validatedEvent = CreateEventSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedEvent.success) {
		return sendErrorApiResponse(reply, {
			error: validatedEvent.error.message,
			status_code: '400',
		});
	}

	//
	// Check if the user has permission for all the specified agencies

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
	// Insert the new event in the database

	const createdEvent = await goDb.offer.events.insertOne({
		...validatedEvent.data,
		associated_patterns: [],
	});

	return sendSuccessApiResponse(reply, createdEvent);
}
