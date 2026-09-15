/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a Year Period by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function lockYearPeriodHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
	//

	//
	// Get the year period from the database

	const foundYearPeriod = await goDb.offer.yearPeriods.findById(request.params.id);

	if (!foundYearPeriod) {
		return sendErrorApiResponse(reply, {
			error: `YearPeriod with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission for all the year period agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: foundYearPeriod.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock period',
			status_code: '403',
		});
	}

	//
	// Toggle the lock status of the year period

	const updatedYearPeriod = await goDb.offer.yearPeriods.updateById(foundYearPeriod._id, { is_locked: !foundYearPeriod.is_locked });

	return sendSuccessApiResponse(reply, updatedYearPeriod);
}
