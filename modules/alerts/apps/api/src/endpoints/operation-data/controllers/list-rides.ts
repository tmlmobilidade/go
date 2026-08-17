/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type AlertsRideFilters, AlertsRideFiltersSchema, type AlertsRideItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listRides(request: FastifyRequest<{ Body: AlertsRideFilters }>, reply: FastifyReply<AlertsRideItem[]>) {
	//

	//
	// Apply permission filters to the request body

	const allowedAgencyIds = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.alerts.scope,
		values: [request.body.agency_id],
	});

	if (!allowedAgencyIds.length) {
		return sendErrorApiResponse(reply, {
			error: 'User does not have permission to read rides for the selected agency.',
			status_code: '404',
		});
	}

	//
	// Validate the filters

	const validatedFilters = AlertsRideFiltersSchema.parse(request.body);

	//
	// Parse and return the result

	return sendSuccessApiResponse(reply, []);
}

