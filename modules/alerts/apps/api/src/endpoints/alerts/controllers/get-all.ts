/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { AlertsListFilters, AlertsListFiltersQuerySchema, AlertsListItem, getAlertsList } from '@tmlmobilidade/go-alerts-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';

/**
 * Returns all Alerts sorted by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getAll(request: FastifyRequest<{ Querystring: AlertsListFilters }>, reply: FastifyReply<AlertsListItem[]>) {
	//

	//
	// Validate query params
	const query = validateQueryParams<AlertsListFilters>(request.query, AlertsListFiltersQuerySchema);

	//
	// Apply permission filters to the request query
	query.agency_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.alerts.scope,
		values: query.agency_ids ?? [],
	});
	//
	// Fetch the alerts data by query
	// and send it back to the client

	const result = await getAlertsList(query);

	return reply
		.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
}
