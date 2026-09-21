/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsUpdateRequest, StopsUpdateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates a Stop by ID.
 * @param request The request object containing the stop ID in the params and the update data in the body
 * @param reply The reply object
 */
export async function updateStopHandler(request: FastifyRequest<{ Body: StopsUpdateRequest, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsUpdateRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Get the stop from the database

	const foundStop = await goDb.infrastructure.stops.findById(request.params.id);

	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: 'Stop not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to run this action

	const hasPermission = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.update,
		permissions: request.permissions,
		resource_key: 'municipality_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: foundStop.municipality_id,
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this stop',
			status_code: '403',
		});
	}

	//
	// Ensure the flag IDs are saved in the legacy IDs array

	const flagIds = validatedRequest.data.flags?.map(flag => flag.stop_id) || [];

	const existingLegacyIds = new Set(foundStop.legacy_ids || []);

	flagIds.forEach(flagId => existingLegacyIds.add(flagId));

	validatedRequest.data.legacy_ids = Array.from(existingLegacyIds);

	//
	// Update the stop in the database

	const updatedStop = await goDb.infrastructure.stops.updateById(request.params.id, validatedRequest.data);

	return sendSuccessApiResponse(reply, updatedStop);
}
