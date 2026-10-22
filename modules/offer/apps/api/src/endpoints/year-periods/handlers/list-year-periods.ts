/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all periods.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listYearPeriodsHandler(request: FastifyRequest, reply: FastifyReply<YearPeriod[]>) {
	//

	//
	// Get the resource permissions for year periods for the current user.

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.read);

	//
	// If no permission found, deny access

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read year periods',
			status_code: '403',
		});
	}

	//
	// Build database query filters based on user permissions

	const queryFilters: Filter<YearPeriod> = {};

	//
	// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
	// filter year periods by those agency IDs.

	if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
		if (!userYearPeriodPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userYearPeriodPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch year periods based on query filters

	const allYearPeriods = await goDb.offer.yearPeriods.findMany(queryFilters);
	return sendSuccessApiResponse(reply, allYearPeriods);

	//
}
