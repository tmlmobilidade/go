/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a route by ID and all patterns attached to it.
 * @param request Fastify request containing route ID
 * @param reply Fastify reply
 */
export async function deleteRouteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const { id } = request.params;
	const route = await goDb.offer.routes.findById(id);

	if (!route) {
		return sendErrorApiResponse(reply, { error: 'Route not found', status_code: '404' });
	}

	//
	// Get the resource permissions for routes for the current user.

	const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

	//
	// If no permission found, deny access

	if (!userRoutePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to delete routes', status_code: '403' });
	}

	//
	// Authorize this route through its parent line's agency.

	const parentLine = await goDb.offer.lines.findById(route.line_id);

	if (!parentLine) {
		return sendErrorApiResponse(reply, { error: 'Parent line not found', status_code: '404' });
	}

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [parentLine.agency_id],
	})) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to delete routes for this agency', status_code: '403' });
	}

	//
	// The parent line controls whether its routes may be changed.

	if (parentLine.is_locked) {
		return sendErrorApiResponse(reply, { error: 'The parent line is locked. Unlock the line first.', status_code: '409' });
	}

	//
	// Locked records must be unlocked through the dedicated lock action.

	if (route.is_locked) {
		return sendErrorApiResponse(reply, { error: 'Cannot delete a locked route. Unlock it first.', status_code: '409' });
	}

	//
	// Cascade deletion must not bypass descendant locks.

	const lockedPatterns = await goDb.offer.patterns.findMany({ is_locked: true, route_id: id });

	if (lockedPatterns.length) {
		return sendErrorApiResponse(reply, { error: 'Cannot delete while a descendant is locked. Unlock it first.', status_code: '409' });
	}

	//

	await goDb.offer.patterns.deleteMany({ route_id: id });
	await goDb.offer.routes.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
