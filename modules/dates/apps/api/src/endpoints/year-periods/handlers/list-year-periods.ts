/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns all Year Periods the current user is allowed to read.
 * @param request The request object
 * @param reply The reply object
 */
export async function listYearPeriodsHandler(request: FastifyRequest, reply: FastifyReply<YearPeriod[]>) {
	//

	//
	// Get the resource permissions for year periods for the current user

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.read);

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read year periods',
			status_code: '403',
		});
	}

	//
	// Build the query filters based on the user permissions.
	// If the agency IDs in the resources do not include the ALLOW_ALL_FLAG,
	// filter the year periods by those agency IDs.

	const queryFilters: Filter<YearPeriod> = {};

	if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
		if (!userYearPeriodPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userYearPeriodPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch the year periods matching the query filters

	const foundYearPeriods = await goDb.offer.yearPeriods.findMany(queryFilters);

	return sendSuccessApiResponse(reply, foundYearPeriods);
}
