/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all events.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listEventsHandler(request: FastifyRequest, reply: FastifyReply<Event[]>) {
	//

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
	// Build database query filters based on user permissions

	const queryFilters: Filter<Event> = {};

	//
	// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
	// filter events by those agency IDs.

	if ('resources' in userEventPermissions && 'agency_ids' in userEventPermissions.resources) {
		if (!userEventPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userEventPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch events based on query filters

	const allEvents = await goDb.offer.events.findMany(queryFilters, { projection: { associated_patterns: 0 } });

	return sendSuccessApiResponse(reply, allEvents);

	//
}
