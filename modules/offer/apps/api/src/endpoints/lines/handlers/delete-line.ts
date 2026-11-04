/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a line by ID and cascades to all its routes and patterns.
 * @param request Fastify request containing line ID in params
 * @param reply Fastify reply
 */
export async function deleteLineHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const { id } = request.params;
	const line = await goDb.offer.lines.findById(id);

	if (!line) {
		return sendErrorApiResponse(reply, { error: 'Line not found', status_code: '404' });
	}

	//
	// Get the resource permissions for lines for the current user.

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

	//
	// If no permission found, deny access

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to delete lines', status_code: '403' });
	}

	//
	// Validate that user has permission for this line's agency

	const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [line.agency_id],
	});

	if (!hasPermissionForAgency) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to delete this line', status_code: '403' });
	}

	//
	// Locked records must be unlocked through the dedicated lock action.

	if (line.is_locked) {
		return sendErrorApiResponse(reply, { error: 'Cannot delete a locked line. Unlock it first.', status_code: '409' });
	}

	//
	// Cascade deletion must not bypass descendant locks.

	const [lockedRoutes, lockedPatterns] = await Promise.all([
		goDb.offer.routes.findMany({ is_locked: true, line_id: id }),
		goDb.offer.patterns.findMany({ is_locked: true, line_id: id }),
	]);

	if (lockedRoutes.length || lockedPatterns.length) {
		return sendErrorApiResponse(reply, { error: 'Cannot delete while a descendant is locked. Unlock it first.', status_code: '409' });
	}

	//

	await goDb.offer.patterns.deleteMany({ line_id: id });
	await goDb.offer.routes.deleteMany({ line_id: id });
	await goDb.offer.lines.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
