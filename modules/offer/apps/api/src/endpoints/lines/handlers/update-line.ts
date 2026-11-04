/* * */

import { populateLine } from '@/utils/lines.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type UpdateLineDto, UpdateLineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing line by ID
 * @param request Fastify request containing line ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateLineHandler(request: FastifyRequest<{ Body: UpdateLineDto, Params: { id: string } }>, reply: FastifyReply<PopulatedLine>) {
	//
	// Validate the client contract before using the request data.

	const validatedLine = UpdateLineSchema.safeParse(request.body);

	if (!validatedLine.success) {
		return sendErrorApiResponse(reply, { error: validatedLine.error.message, status_code: '400' });
	}

	//

	//
	// Get the Line from the database

	const lineData = await goDb.offer.lines.findById(request.params.id);

	if (!lineData) {
		return sendErrorApiResponse(reply, { error: 'Line not found', status_code: '404' });
	}

	//
	// Get the resource permissions for lines for the current user.

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

	//
	// If no permission found, deny access

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to update lines', status_code: '403' });
	}

	//
	// Validate that user has permission for this line's agency

	const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [lineData.agency_id],
	});

	if (!hasPermissionForAgency) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to update this line', status_code: '403' });
	}

	//
	// Updating agency ownership also requires permission for the new agency.

	if (validatedLine.data.agency_id && !PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [validatedLine.data.agency_id],
	})) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to update lines for this agency', status_code: '403' });
	}

	//
	// Locked records must be unlocked through the dedicated lock action.

	if (lineData.is_locked) {
		return sendErrorApiResponse(reply, { error: 'Cannot update a locked line. Unlock it first.', status_code: '409' });
	}

	//
	// Update the line

	const updatedLine = await goDb.offer.lines.updateOne({ _id: lineData._id }, {
		...validatedLine.data,
		updated_by: request.me._id,
	});
	const populatedLine = await populateLine(updatedLine);

	//
	// Send the updated line data as the response

	return sendSuccessApiResponse(reply, populatedLine);

	//
}
