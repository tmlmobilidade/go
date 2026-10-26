/* * */

import { populateLine } from '@/utils/lines.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single line by ID with its routes
 * @param request Fastify request containing line ID in params
 * @param reply Fastify reply
 */
export async function getLineHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<PopulatedLine>) {
	//

	//
	// Get the Line from the database

	const lineData = await goDb.offer.lines.findById(request.params.id);

	if (!lineData) {
		return sendErrorApiResponse(reply, { error: 'Line not found', status_code: '404' });
	}

	//
	// Get the resource permissions for lines for the current user.

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

	//
	// If no permission found, deny access

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read lines', status_code: '403' });
	}

	//
	// Validate that user has permission for this line's agency

	const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [lineData.agency_id],
	});

	if (!hasPermissionForAgency) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to read this line', status_code: '403' });
	}

	//
	// Return the line data with routes

	const populatedLine = await populateLine(lineData);

	return sendSuccessApiResponse(reply, populatedLine);

	//
}
