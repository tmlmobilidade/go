/* * */

import { populateRoute } from '@/utils/routes.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type UpdateRouteDto, UpdateRouteSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing route by ID
 * @param request Fastify request containing route ID and update data in body
 * @param reply Fastify reply
 */
export async function updateRouteHandler(request: FastifyRequest<{ Body: UpdateRouteDto, Params: { id: string } }>, reply: FastifyReply<RoutesDetail>) {
	//
	// Validate the client contract before using the request data.

	const validatedRoute = UpdateRouteSchema.safeParse(request.body);

	if (!validatedRoute.success) {
		return sendErrorApiResponse(reply, { error: validatedRoute.error.message, status_code: '400' });
	}

	//

	//
	// Get the Route from the database

	const routeData = await goDb.offer.routes.findById(request.params.id);

	if (!routeData) {
		return sendErrorApiResponse(reply, { error: 'Route not found', status_code: '404' });
	}

	//
	// Get the resource permissions for routes for the current user.

	const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

	//
	// If no permission found, deny access

	if (!userRoutePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to update routes', status_code: '403' });
	}

	//
	// Authorize this route through its parent line's agency.

	const parentLine = await goDb.offer.lines.findById(routeData.line_id);

	if (!parentLine) {
		return sendErrorApiResponse(reply, { error: 'Parent line not found', status_code: '404' });
	}

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [parentLine.agency_id],
	})) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to update routes for this agency', status_code: '403' });
	}

	//
	// The parent line controls whether its routes may be changed.

	if (parentLine.is_locked) {
		return sendErrorApiResponse(reply, { error: 'The parent line is locked. Unlock the line first.', status_code: '409' });
	}

	//
	// Moving a route also affects pattern ownership and needs a dedicated operation.

	if (validatedRoute.data.line_id !== undefined && validatedRoute.data.line_id !== routeData.line_id) {
		return sendErrorApiResponse(reply, { error: 'A route cannot be reassigned to another line through an ordinary update.', status_code: '409' });
	}

	//
	// Locked records must be unlocked through the dedicated lock action.

	if (routeData.is_locked) {
		return sendErrorApiResponse(reply, { error: 'Cannot update a locked route. Unlock it first.', status_code: '409' });
	}

	//
	// Update the route

	const updatedRoute = await goDb.offer.routes.updateOne({ _id: routeData._id }, {
		...validatedRoute.data,
		updated_by: request.me._id,
	});

	//
	// Send the updated route data as the response

	return sendSuccessApiResponse(reply, await populateRoute(updatedRoute));

	//
}
