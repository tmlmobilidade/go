/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateYearPeriodDto, CreateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { handleYearPeriodDateAssignment } from '../utils/handle-date-assignment.js';

/**
 * Creates a new period.
 * If dates are provided, handles conflicts by removing those dates from other periods of the same agency.
 * @param request Fastify request containing period data
 * @param reply Fastify reply
 */
export async function createYearPeriodHandler(request: FastifyRequest<{ Body: CreateYearPeriodDto }>, reply: FastifyReply<YearPeriod>) {
	//

	//
	// Validate the client contract before permissions or assignment side effects.

	const validatedYearPeriod = CreateYearPeriodSchema.safeParse(request.body);

	if (!validatedYearPeriod.success) {
		return sendErrorApiResponse(reply, {
			error: validatedYearPeriod.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for periods for the current user.

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.create);

	//
	// If no permission found, deny access

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create periods',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL specified agencies

	if (!PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: validatedYearPeriod.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create these year periods.',
			status_code: '403',
		});
	}

	//
	// If dates are provided, handle conflicts with other periods of the same agency set

	if (validatedYearPeriod.data.dates && validatedYearPeriod.data.dates.length > 0) {
		const newDates = validatedYearPeriod.data.dates;
		validatedYearPeriod.data.dates = await handleYearPeriodDateAssignment(validatedYearPeriod.data.agency_ids, newDates, request.me._id);
	}

	//
	// Create the new period

	const newPeriod = await goDb.offer.yearPeriods.insertOne({ ...validatedYearPeriod.data, created_by: request.me._id, updated_by: request.me._id });

	//
	// Send the response

	return sendSuccessApiResponse(reply, newPeriod);

	//
}
