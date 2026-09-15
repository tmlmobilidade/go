/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event, type Pattern } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns an Event by ID, with the patterns that reference it in manual rules.
 * @param request The request object
 * @param reply The reply object
 */
export async function getEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Event>) {
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
	// Check if the user has permission for at least one of the event agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.events.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: foundEvent.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this event',
			status_code: '403',
		});
	}

	//
	// Get the patterns that reference this event in manual pattern rules

	const associatedPatterns: Pick<Pattern, '_id' | 'code' | 'headsign' | 'line_id' | 'route_id'>[] = await goDb.offer.patterns.aggregate([
		{
			$match: {
				event_id: request.params.id,
				kind: 'manual',
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

	return sendSuccessApiResponse(reply, {
		...foundEvent,
		associated_patterns: associatedPatterns,
	});
}
