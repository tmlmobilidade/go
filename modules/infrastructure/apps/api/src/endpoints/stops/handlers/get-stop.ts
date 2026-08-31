/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single stop by ID.
 * @param request Fastify request containing stop ID in params.
 * @param reply Fastify reply.
 */
export async function getStopHandler(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	// Get the stop from the database
	const foundStop = await goDb.infrastructure.stops.findById(Number(request.params.id));
	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: `Can not find stop with ID ${request.params.id}`,
			status_code: '404',
		});
	}

	if (foundStop.flags.length !== 0) {
		// Check if the user has permission to run this action
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: foundStop.flags.flatMap(flag => flag.agency_ids),
		});

		if (!hasPermission) {
			return sendErrorApiResponse(reply, {
				error: 'You are not authorized to read this stop',
				status_code: '403',
			});
		}
	}

	//
	// Get pattern ids that reference this event in manual pattern rules

	const associatedPatterns = await goDb.offer.patterns.findMany(
		{
			'path.stop_id': Number(request.params.id),
		},
		{
			projection: {
				_id: 1,
				code: 1,
				headsign: 1,
				line_id: 1,
				route_id: 1,
			},
			sort: { code: 1 },
		},
	);

	if (!associatedPatterns) {
		return sendErrorApiResponse(reply, {
			error: `Can not get associated patterns for stop with ID ${request.params.id}`,
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, { ...foundStop, associated_patterns: associatedPatterns });
}
