/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateHolidayDto, CreateHolidaySchema, type Holiday } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new holiday.
 * @param request Fastify request containing holiday data
 * @param reply Fastify reply
 */
export async function createHolidayHandler(request: FastifyRequest<{ Body: CreateHolidayDto }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Validate the client contract before using the request data.

	const validatedHoliday = CreateHolidaySchema.safeParse(request.body);

	if (!validatedHoliday.success) {
		return sendErrorApiResponse(reply, {
			error: validatedHoliday.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.create);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create holidays',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: validatedHoliday.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create holidays for these agencies. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//
	// Create the new holiday

	const newHoliday = await goDb.offer.holidays.insertOne({
		...validatedHoliday.data,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, newHoliday);

	//
}
