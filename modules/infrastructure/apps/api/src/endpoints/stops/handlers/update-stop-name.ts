/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsUpdateNameRequest, StopsUpdateNameRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates the name, short name and TTS name of a Stop by ID.
 * @param request The request object containing the stop ID in the params and the names in the body
 * @param reply The reply object
 */
export async function updateStopNameHandler(request: FastifyRequest<{ Body: StopsUpdateNameRequest, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsUpdateNameRequestSchema.safeParse(request.body);

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
		action: PermissionCatalog.all.stops.actions.edit_name,
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
	// Update the stop names and return the updated stop

	const updatedStop = await goDb.infrastructure.stops.updateById(request.params.id, {
		name: validatedRequest.data.name,
		short_name: validatedRequest.data.short_name,
		tts_name: validatedRequest.data.tts_name,
	});

	return sendSuccessApiResponse(reply, updatedStop);
}
