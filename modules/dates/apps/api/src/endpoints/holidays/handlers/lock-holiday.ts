/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a Holiday by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function lockHolidayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Holiday>) {
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
		action: PermissionCatalog.all.holidays.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: foundHoliday.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock holiday. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Toggle the lock status of the holiday

	const updatedHoliday = await goDb.offer.holidays.updateById(foundHoliday._id, { is_locked: !foundHoliday.is_locked });

	return sendSuccessApiResponse(reply, updatedHoliday);
}
