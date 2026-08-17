/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type AlertsStopsFilters, AlertsStopsFiltersSchema, type AlertsStopsItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listStops(request: FastifyRequest<{ Body: AlertsStopsFilters }>, reply: FastifyReply<AlertsStopsItem[]>) {
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
			error: 'User does not have permission to read stops for the selected agency.',
			status_code: '404',
		});
	}

	//
	// Validate the filters

	const validatedFilters = AlertsStopsFiltersSchema.parse(request.body);

	//
	// Parse and return the result

	return sendSuccessApiResponse(reply, []);
}

