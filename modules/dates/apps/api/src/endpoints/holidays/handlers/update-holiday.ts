/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday, type UpdateHolidayDto, UpdateHolidaySchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates a Holiday in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateHolidayHandler(request: FastifyRequest<{ Body: UpdateHolidayDto, Params: { id: string } }>, reply: FastifyReply<Holiday>) {
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
		action: PermissionCatalog.all.holidays.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: foundHoliday.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this holiday. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Validate the request body

	const validatedHoliday = UpdateHolidaySchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedHoliday.success) {
		return sendErrorApiResponse(reply, {
			error: validatedHoliday.error.message,
			status_code: '400',
		});
	}

	//
	// Update the holiday in the database

	const updatedHoliday = await goDb.offer.holidays.updateById(foundHoliday._id, validatedHoliday.data);

	return sendSuccessApiResponse(reply, updatedHoliday);
}
