/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns all Holidays the current user is allowed to read.
 * @param request The request object
 * @param reply The reply object
 */
export async function listHolidaysHandler(request: FastifyRequest, reply: FastifyReply<Holiday[]>) {
	//

	//
	// Get the resource permissions for holidays for the current user

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.read);

	if (!userHolidayPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read holidays',
			status_code: '403',
		});
	}

	//
	// Build the query filters based on the user permissions.
	// If the agency IDs in the resources do not include the ALLOW_ALL_FLAG,
	// filter the holidays by those agency IDs.

	const queryFilters: Filter<Holiday> = {};

	if ('resources' in userHolidayPermissions && 'agency_ids' in userHolidayPermissions.resources) {
		if (!userHolidayPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userHolidayPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch the holidays matching the query filters

	const foundHolidays = await goDb.offer.holidays.findMany(queryFilters);

	return sendSuccessApiResponse(reply, foundHolidays);
}
