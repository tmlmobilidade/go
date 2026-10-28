/* * */

import { populateLine } from '@/utils/lines.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type CreateLineDto, CreateLineSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new line.
 * @param request Fastify request containing line data
 * @param reply Fastify reply
 */
export async function createLineHandler(request: FastifyRequest<{ Body: CreateLineDto }>, reply: FastifyReply<PopulatedLine>) {
	//
	// Validate the client contract before using the request data.

	const validatedLine = CreateLineSchema.safeParse(request.body);

	if (!validatedLine.success) {
		return sendErrorApiResponse(reply, { error: validatedLine.error.message, status_code: '400' });
	}

	//

	//
	// Get the resource permissions for lines for the current user.

	const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

	//
	// If no permission found, deny access

	if (!userLinePermissions) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to create lines', status_code: '403' });
	}

	//
	// Validate that user has permission for the specified agency

	const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [validatedLine.data.agency_id],
	});

	if (!hasPermissionForAgency) {
		return sendErrorApiResponse(reply, { error: 'You are not authorized to create lines for this agency', status_code: '403' });
	}

	//
	// Create the new line

	const newLine = await goDb.offer.lines.insertOne({
		...validatedLine.data,
		created_by: request.me._id,
		is_locked: false,
		updated_by: request.me._id,
	});
	const populatedLine = await populateLine(newLine);

	//
	// Send the response

	return sendSuccessApiResponse(reply, populatedLine);

	//
}
