/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type AlertsLinesFilters, AlertsLinesFiltersSchema, type AlertsLinesItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Get lines by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listLines(request: FastifyRequest<{ Body: AlertsLinesFilters }>, reply: FastifyReply<AlertsLinesItem[]>) {
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
			error: 'User does not have permission to read lines for the selected agency.',
			status_code: '404',
		});
	}

	//
	// Validate the filters

	const validatedFilters = AlertsLinesFiltersSchema.parse(request.body);

	//
	// Parse and return the result

	return sendSuccessApiResponse(reply, []);
}

