/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Lists all stops, sorted by creation date descending
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listStopsHandler(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
	//

	//
	// Get the resource permissions for stops for the current user.
	// The stops will be filtered by the agency_ids in the resources.

	const userStopPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.read);

	const queryFilters: Filter<Stop> = {};
	if ('resources' in userStopPermissions && userStopPermissions.resources) {
		const resources = userStopPermissions.resources;
		if ('agency_ids' in resources && !resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.$or = [
				{ flags: { $elemMatch: { agency_ids: { $in: resources['agency_ids'] } } } },
				{ flags: { $size: 0 } },
			];
		}
	}
	const data = await goDb.infrastructure.stops.findMany(queryFilters, {
		projection: { _id: 1, flags: 1, is_deleted: 1, latitude: 1, legacy_ids: 1, lifecycle_status: 1, longitude: 1, municipality_id: 1, name: 1, system_status: 1 },
		sort: { created_at: -1 },
	});

	if (!data) {
		return sendErrorApiResponse(reply, {
			error: 'Can not get stops from database',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, data);
}
