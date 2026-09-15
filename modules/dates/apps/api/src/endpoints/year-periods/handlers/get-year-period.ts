/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns a Year Period by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getYearPeriodHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
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
	// Check if the user has permission for at least one of the year period agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.year_periods.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: foundYearPeriod.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this year period',
			status_code: '403',
		});
	}

	return sendSuccessApiResponse(reply, foundYearPeriod);
}
