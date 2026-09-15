/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateHolidayDto, CreateHolidaySchema, type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new Holiday in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function createHolidayHandler(request: FastifyRequest<{ Body: CreateHolidayDto }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Validate the request body

	const validatedHoliday = CreateHolidaySchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedHoliday.success) {
		return sendErrorApiResponse(reply, {
			error: validatedHoliday.error.message,
			status_code: '400',
		});
	}

	//
	// Check if the user has permission for all the specified agencies

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
	// Insert the new holiday in the database

	const createdHoliday = await goDb.offer.holidays.insertOne(validatedHoliday.data);

	return sendSuccessApiResponse(reply, createdHoliday);
}
