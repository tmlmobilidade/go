/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsUpdateRequest, StopsUpdateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing stop by ID
 * @param request Fastify request containing stop ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateStopHandler(request: FastifyRequest<{ Body: StopsUpdateRequest, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsUpdateRequestSchema.parse(request.body);

	//
	// Fetch stop from the database

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
		requiredPermission: { action: 'update', scope: 'stops' },
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
	// Ensure the flag IDs are saved in the legacy IDs array

	const flagIds = validatedRequest.flags?.map(flag => flag.stop_id) || [];

	const existingLegacyIds = new Set(foundStop.legacy_ids || []);

	flagIds.forEach(flagId => existingLegacyIds.add(flagId));

	validatedRequest.legacy_ids = Array.from(existingLegacyIds);

	//
	// Perform the update

	const updateResult = await goDb.infrastructure.stops.updateById(request.params.id, validatedRequest);

	return sendSuccessApiResponse(reply, updateResult);
}
