/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns a Holiday by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getHolidayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Get the holiday from the database

	const foundHoliday = await goDb.offer.holidays.findById(request.params.id);

	if (!foundHoliday) {
		return sendErrorApiResponse(reply, {
			error: `Holiday with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission for at least one of the holiday agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.holidays.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: foundHoliday.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this holiday',
			status_code: '403',
		});
	}

	return sendSuccessApiResponse(reply, foundHoliday);
}
