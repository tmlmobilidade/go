/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a Holiday from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteHolidayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
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
	// Check if the user has permission for all the holiday agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: foundHoliday.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this holiday. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Delete the holiday from the database

	await goDb.offer.holidays.deleteById(foundHoliday._id);

	return sendSuccessApiResponse(reply, undefined);
}
