/* * */

import { handleYearPeriodDateAssignment } from '@/utils/handle-year-period-date-assignment.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateYearPeriodDto, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates a Year Period in the database.
 * If dates are provided, they are merged with the existing dates and the conflicting dates
 * are removed from the other Year Periods with the same agency set.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateYearPeriodHandler(request: FastifyRequest<{ Body: UpdateYearPeriodDto, Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
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
		action: PermissionCatalog.all.year_periods.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: foundYearPeriod.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock this period',
			status_code: '403',
		});
	}

	//
	// Validate the request body

	const validatedYearPeriod = UpdateYearPeriodSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedYearPeriod.success) {
		return sendErrorApiResponse(reply, {
			error: validatedYearPeriod.error.message,
			status_code: '400',
		});
	}

	//
	// If dates are provided, merge them with the existing dates
	// and handle the conflicts with the other year periods of the same agency set

	if (validatedYearPeriod.data.dates && validatedYearPeriod.data.dates.length > 0) {
		validatedYearPeriod.data.dates = await handleYearPeriodDateAssignment({
			agencyIds: foundYearPeriod.agency_ids,
			existingDates: foundYearPeriod.dates ?? [],
			newDates: validatedYearPeriod.data.dates,
			yearPeriodId: foundYearPeriod._id,
		});
	}

	//
	// Update the year period in the database

	const updatedYearPeriod = await goDb.offer.yearPeriods.updateById(foundYearPeriod._id, validatedYearPeriod.data);

	return sendSuccessApiResponse(reply, updatedYearPeriod);
}
