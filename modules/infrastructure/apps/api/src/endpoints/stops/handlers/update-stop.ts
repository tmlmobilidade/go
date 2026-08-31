/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, type StopId, type UpdateStopDto } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing stop by ID
 * @param request Fastify request containing stop ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateStopHandler(request: FastifyRequest<{ Body: UpdateStopDto, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
	// Get the stop from the database
	const foundStop = await goDb.infrastructure.stops.findById(Number(request.params.id));
	if (!foundStop) {
		return sendErrorApiResponse(reply, {
			error: 'Stop not found',
			status_code: '404',
		});
	}

	if (
		foundStop.flags.length !== 0
		|| (
			request.body.flags?.length !== 0
			&& !foundStop.flags.flatMap(flag => flag.agency_ids).every(agencyId => request.body.flags?.flatMap(flag => flag.agency_ids).includes(agencyId))
		)
	) {
		// Check if the user has permission to run this action
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: foundStop.flags.flatMap(flag => flag.agency_ids),
		});

		if (!hasPermission) {
			return sendErrorApiResponse(reply, {
				error: 'You are not authorized to update this stop',
				status_code: '403',
			});
		}
	}

	// Ensure the flag IDs are saved in the legacy IDs array
	const flagIds = request.body.flags?.map(flag => flag.stop_id) || [];
	const existingLegacyIds = new Set(foundStop.legacy_ids || []);
	flagIds.forEach(flagId => existingLegacyIds.add(flagId));
	request.body.legacy_ids = Array.from(existingLegacyIds);
	// Perform the update
	const data = await goDb.infrastructure.stops.updateById(Number(request.params.id), request.body);
	return sendSuccessApiResponse(reply, data);
}
