/* * */

import { handleYearPeriodDateAssignment } from '@/utils/handle-year-period-date-assignment.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateYearPeriodDto, CreateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new Year Period in the database.
 * If dates are provided, the conflicting dates are removed from the other Year Periods with the same agency set.
 * @param request The request object
 * @param reply The reply object
 */
export async function createYearPeriodHandler(request: FastifyRequest<{ Body: CreateYearPeriodDto }>, reply: FastifyReply<YearPeriod>) {
	//

	//
	// Validate the request body

	const validatedYearPeriod = CreateYearPeriodSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedYearPeriod.success) {
		return sendErrorApiResponse(reply, {
			error: validatedYearPeriod.error.message,
			status_code: '400',
		});
	}

	//
	// Check if the user has permission for all the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: validatedYearPeriod.data.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create periods for all specified agencies',
			status_code: '403',
		});
	}

	//
	// If dates are provided, handle the conflicts with the other year periods of the same agency set

	if (validatedYearPeriod.data.dates && validatedYearPeriod.data.dates.length > 0) {
		validatedYearPeriod.data.dates = await handleYearPeriodDateAssignment({
			agencyIds: validatedYearPeriod.data.agency_ids,
			newDates: validatedYearPeriod.data.dates,
		});
	}

	//
	// Insert the new year period in the database

	const createdYearPeriod = await goDb.offer.yearPeriods.insertOne(validatedYearPeriod.data);

	return sendSuccessApiResponse(reply, createdYearPeriod);
}
