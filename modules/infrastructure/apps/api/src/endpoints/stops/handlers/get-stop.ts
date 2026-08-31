/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single stop by ID.
 * @param request Fastify request containing stop ID in params.
 * @param reply Fastify reply.
 */
export async function getStopHandler(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	//

	//
	// Fetch stop from the database

	const foundStop = await goDb.infrastructure.stops.findById(request.params.id);

	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: `Can not find stop with ID ${request.params.id}`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to read this stop

	const hasPermission = hasPermissionResource(request.permissions, {
		requiredPermission: { action: 'read', scope: 'stops' },
		requiredValue: foundStop.municipality_id,
		resourceKey: 'municipality_ids',
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'User does not have permission to read this stop',
			status_code: '401',
		});
	}

	//
	// Get pattern ids that reference this event in manual pattern rules

	// const associatedPatterns = await goDb.offer.patterns.findMany(
	// 	{
	// 		'path.stop_id': Number(request.params.id),
	// 	},
	// 	{
	// 		projection: {
	// 			_id: 1,
	// 			code: 1,
	// 			headsign: 1,
	// 			line_id: 1,
	// 			route_id: 1,
	// 		},
	// 		sort: { code: 1 },
	// 	},
	// );

	// if (!associatedPatterns) {
	// 	return sendErrorApiResponse(reply, {
	// 		error: `Can not get associated patterns for stop with ID ${request.params.id}`,
	// 		status_code: '500',
	// 	});
	// }

	return sendSuccessApiResponse(reply, foundStop);
}
