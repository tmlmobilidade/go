/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type EventsDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single event by ID
 * @param request Fastify request containing event ID in params
 * @param reply Fastify reply
 */
export async function getEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<EventsDetail>) {
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

	const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.read);

	//
	// If no permission found, deny access

	if (!userEventPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read events',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for at least one of this event's agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.events.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: eventData.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this event',
			status_code: '403',
		});
	}

	//
	// Get pattern ids that reference this event in manual pattern rules

	const associatedPatterns: EventsDetail['associated_patterns'] = await goDb.offer.patterns.aggregate([
		{
			$match: {
				rules: {
					$elemMatch: {
						event_id: request.params.id,
						kind: 'manual',
					},
				},
			},
		},
		{
			$project: {
				_id: 1,
				code: 1,
				headsign: 1,
				line_id: 1,
				route_id: 1,
			},
		},
		{ $sort: { code: 1 } },
	]);

	//
	// Fetch the event data

	return sendSuccessApiResponse(reply, {
		...eventData,
		associated_patterns: associatedPatterns,
	});

	//
}
