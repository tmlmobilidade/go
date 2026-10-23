/* * */

import { populateRoute } from '@/utils/routes.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single route by ID
 * @param request Fastify request containing route ID
 * @param reply Fastify reply
 */
export async function getRouteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RoutesDetail>) {
	//

	//
	// Get the Route from the database

	const routeData = await goDb.offer.routes.findById(request.params.id);

	if (!routeData) {
		return sendErrorApiResponse(reply, { error: 'Route not found', status_code: '404' });
	}

	//
	// Get the resource permissions for routes for the current user.

	const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

	//
	// If no permission found, deny access

	if (!userRoutePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read routes', status_code: '403' });
	}

	//
	// Authorize this route through its parent line's agency.

	const parentLine = await goDb.offer.lines.findById(routeData.line_id);

	if (!parentLine) {
		return sendErrorApiResponse(reply, { error: 'Parent line not found', status_code: '404' });
	}

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [parentLine.agency_id],
	})) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to get routes for this agency', status_code: '403' });
	}

	//
	// Fetch the route's pattern summaries for the detail response.

	return sendSuccessApiResponse(reply, await populateRoute(routeData));
}
