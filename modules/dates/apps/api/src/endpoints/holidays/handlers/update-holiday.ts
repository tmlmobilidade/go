/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday, type UpdateHolidayDto, UpdateHolidaySchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing holiday by ID
 * @param request Fastify request containing holiday ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateHolidayHandler(request: FastifyRequest<{ Body: UpdateHolidayDto, Params: { id: string } }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedHoliday = UpdateHolidaySchema.safeParse(request.body);

	if (!validatedHoliday.success) {
		return sendErrorApiResponse(reply, {
			error: validatedHoliday.error.message,
			status_code: '400',
		});
	}

	//
	// Get the Holiday from the database

	const holidayData = await goDb.offer.holidays.findById(request.params.id);

	if (!holidayData) {
		return sendErrorApiResponse(reply, {
			error: 'Holiday not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.update);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update holidays',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this holiday's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: holidayData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update this holiday. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Check permission for every newly assigned agency as well.

	if (validatedHoliday.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: validatedHoliday.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update holidays for these agencies.',
			status_code: '403',
		});
	}

	//
	// Update the holiday with parsed client fields and the authenticated updater.

	const updatedHoliday = await goDb.offer.holidays.updateById(holidayData._id, {
		...validatedHoliday.data,
		updated_by: request.me._id,
	});

	//
	// Send the updated holiday data as the response

	return sendSuccessApiResponse(reply, updatedHoliday);

	//
}
