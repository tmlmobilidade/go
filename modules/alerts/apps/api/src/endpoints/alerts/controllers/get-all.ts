/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Returns all Alerts sorted by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getAll(request: FastifyRequest, reply: FastifyReply<Alert[]>) {
	// Retrieve permissions for the current user
	const userReadPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.read);

	// Setup a query filter based on permissions
	const permissionsQuery = userReadPermissions.resources?.agency_ids?.includes(PermissionCatalog.ALLOW_ALL_FLAG)
		// If user has access to all agencies, no filter is applied
		? {}
		// Otherwise, filter by the allowed agency IDs
		: { agency_id: { $in: userReadPermissions.resources?.agency_ids ?? [] } };
	// Retrieve and send all alerts
	const allAlerts = await goDb.operation.alerts.findMany({ ...permissionsQuery }, { sort: { active_period_start_date: -1 } });

	// Send the alerts to the client
	reply.send({ data: allAlerts, error: null, statusCode: HTTP_STATUS.OK });
}
