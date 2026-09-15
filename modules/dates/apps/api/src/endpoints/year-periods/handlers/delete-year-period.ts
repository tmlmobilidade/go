/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a Year Period from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteYearPeriodHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
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
		action: PermissionCatalog.all.year_periods.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: foundYearPeriod.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this period',
			status_code: '403',
		});
	}

	//
	// Delete the year period from the database

	await goDb.offer.yearPeriods.deleteById(foundYearPeriod._id);

	return sendSuccessApiResponse(reply, undefined);
}
