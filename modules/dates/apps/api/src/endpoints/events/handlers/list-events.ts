/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Event } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns all Events the current user is allowed to read.
 * @param request The request object
 * @param reply The reply object
 */
export async function listEventsHandler(request: FastifyRequest, reply: FastifyReply<Event[]>) {
	//

	//
	// Get the resource permissions for events for the current user

	const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.read);

	if (!userEventPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read events',
			status_code: '403',
		});
	}

	//
	// Build the query filters based on the user permissions.
	// If the agency IDs in the resources do not include the ALLOW_ALL_FLAG,
	// filter the events by those agency IDs.

	const queryFilters: Filter<Event> = {};

	if ('resources' in userEventPermissions && 'agency_ids' in userEventPermissions.resources) {
		if (!userEventPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userEventPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch the events matching the query filters

	const foundEvents = await goDb.offer.events.findMany(queryFilters);

	return sendSuccessApiResponse(reply, foundEvents);
}
