/* * */

import { populateRoute } from '@/utils/routes.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RoutesDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type CreateRouteDto, CreateRouteSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new route.
 * @param request Fastify request containing route data in body
 * @param reply Fastify reply
 */
export async function createRouteHandler(request: FastifyRequest<{ Body: CreateRouteDto }>, reply: FastifyReply<RoutesDetail>) {
	//
	// Validate the client contract before using the request data.

	const validatedRoute = CreateRouteSchema.safeParse(request.body);

	if (!validatedRoute.success) {
		return sendErrorApiResponse(reply, { error: validatedRoute.error.message, status_code: '400' });
	}

	//

	//
	// Get the resource permissions for routes for the current user.

	const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

	//
	// If no permission found, deny access

	if (!userRoutePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to create routes', status_code: '403' });
	}

	//
	// Authorize this route through its parent line's agency.

	const parentLine = await goDb.offer.lines.findById(validatedRoute.data.line_id);

	if (!parentLine) {
		return sendErrorApiResponse(reply, { error: 'Parent line not found', status_code: '404' });
	}

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [parentLine.agency_id],
	})) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to create routes for this agency', status_code: '403' });
	}

	//
	// The parent line controls whether its routes may be changed.

	if (parentLine.is_locked) {
		return sendErrorApiResponse(reply, { error: 'The parent line is locked. Unlock the line first.', status_code: '409' });
	}

	//
	// Create the new route

	const newRoute = await goDb.offer.routes.insertOne({
		...validatedRoute.data,
		created_by: request.me._id,
		is_locked: false,
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, await populateRoute(newRoute));

	//
}
