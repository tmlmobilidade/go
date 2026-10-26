/* * */

import { populateRoute } from '@/utils/routes.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a route by ID
 * @param request Fastify request containing route ID
 * @param reply Fastify reply
 */
export async function lockRouteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RoutesDetail>) {
	//

	//
	// Get the Route from the database

	const routeData = await goDb.offer.routes.findById(request.params.id);

	if (!routeData) {
		return sendErrorApiResponse(reply, { error: 'Route not found', status_code: '404' });
	}

	//
	// Get the resource permissions for routes for the current user.

	const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

	//
	// If no permission found, deny access

	if (!userRoutePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to lock/unlock routes', status_code: '403' });
	}

	//
	// Authorize this route through its parent line's agency.

	const parentLine = await goDb.offer.lines.findById(routeData.line_id);

	if (!parentLine) {
		return sendErrorApiResponse(reply, { error: 'Parent line not found', status_code: '404' });
	}

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [parentLine.agency_id],
	})) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to lock routes for this agency', status_code: '403' });
	}

	//
	// The parent line controls whether its routes may be changed.

	if (parentLine.is_locked) {
		return sendErrorApiResponse(reply, { error: 'The parent line is locked. Unlock the line first.', status_code: '409' });
	}

	// If authorized, toggle the lock status of the route
	await goDb.offer.routes.updateOne({ _id: request.params.id }, { is_locked: !routeData.is_locked, updated_by: request.me._id });
	const foundRoute = await goDb.offer.routes.findById(request.params.id);
	if (!foundRoute) {
		return sendErrorApiResponse(reply, { error: 'Route not found', status_code: '404' });
	}

	return sendSuccessApiResponse(reply, await populateRoute(foundRoute));

	//
}
