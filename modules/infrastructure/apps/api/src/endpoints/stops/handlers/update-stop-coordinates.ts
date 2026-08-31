/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsUpdateCoordinatesRequest, StopsUpdateCoordinatesRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing stop by ID
 * @param request Fastify request containing stop ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateStopCoordinatesHandler(request: FastifyRequest<{ Body: StopsUpdateCoordinatesRequest, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsUpdateCoordinatesRequestSchema.parse(request.body);

	//
	// Fetch the stop from the database

	const foundStop = await goDb.infrastructure.stops.findById(request.params.id);

	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: 'Stop not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to run this action

	const hasPermission = hasPermissionResource(request.permissions, {
		requiredPermission: { action: 'edit_coordinates', scope: 'stops' },
		requiredValue: foundStop.municipality_id,
		resourceKey: 'municipality_ids',
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this stop',
			status_code: '403',
		});
	}

	//
	// Update the stop name and return the updated stop

	const data = await goDb.infrastructure.stops.updateById(request.params.id, { latitude: validatedRequest.latitude, longitude: validatedRequest.longitude });

	return sendSuccessApiResponse(reply, data);
}
