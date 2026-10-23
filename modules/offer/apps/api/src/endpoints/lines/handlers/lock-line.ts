/* * */

import { populateLine } from '@/utils/lines.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a line by ID
 * @param request Fastify request containing line ID in params
 * @param reply Fastify reply
 */
export async function lockLineHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<PopulatedLine>) {
	//

	//
	// Get the Line from the database

	const lineData = await goDb.offer.lines.findById(request.params.id);

	if (!lineData) {
		return sendErrorApiResponse(reply, { error: 'Line not found', status_code: '404' });
	}

	//
	// Get the resource permissions for lines for the current user.

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

	//
	// If no permission found, deny access

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to lock/unlock lines', status_code: '403' });
	}

	//
	// Validate that user has permission for this line's agency

	const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [lineData.agency_id],
	});

	if (!hasPermissionForAgency) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to perform this action: toggle lock line', status_code: '403' });
	}

	// If authorized, toggle the lock status of the line
	await goDb.offer.lines.updateOne({ _id: request.params.id }, { is_locked: !lineData.is_locked, updated_by: request.me._id });
	const foundLine = await goDb.offer.lines.findById(request.params.id);
	if (!foundLine) {
		return sendErrorApiResponse(reply, { error: 'Line not found', status_code: '404' });
	}

	const populatedLine = await populateLine(foundLine);

	return sendSuccessApiResponse(reply, populatedLine);

	//
}
