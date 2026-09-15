/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';

/**
 * Update the processing status of a Ride.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function updateProcessingStatusHandler(request: FastifyRequest<{ Body: { processing_status: ProcessingStatus }, Params: { id: string } }>, reply: FastifyReply<Ride>) {
	//

	//
	// Retrieve the Ride from the database

	const rideData = await goDb.operation.rides.findById(request.params.id);

	if (!rideData) {
		return sendErrorApiResponse(reply, {
			error: `Ride with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permissions to update the processing status of the ride

	const hasPermissionUpdateProcessingStatus = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.rides.actions.analysis_reprocess,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.rides.scope,
		value: rideData.agency_id,
	});

	if (!hasPermissionUpdateProcessingStatus) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update the processing status of this ride.',
			status_code: '403',
		});
	}

	//
	// Update the Ride in goDb to 'waiting' status

	const updatedRideResult = await goDb.operation.rides.updateById(request.params.id, { processing_status: 'waiting' });
	await labDb.operation.rides.insert('JSONEachRow', [updatedRideResult]);

	return sendSuccessApiResponse(reply, updatedRideResult);
}
