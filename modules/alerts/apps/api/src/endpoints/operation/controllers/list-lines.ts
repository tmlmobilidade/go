/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type AlertsLinesFilters, AlertsLinesFiltersSchema, type AlertsLinesItem, alertsLinesQuery } from '@tmlmobilidade/go-alerts-pckg-types';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
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
	// Build query parameters and execute the query

	const params: Record<string, number | string> = {
		1: validatedFilters.agency_id,
		2: validatedFilters.start_time_scheduled_start,
		3: validatedFilters.start_time_scheduled_end,
	};

	const queryResult = await labDb.queryFromString<AlertsLinesItem>(alertsLinesQuery, params);

	//
	// Parse and return the result

	return sendSuccessApiResponse(reply, queryResult);
}

