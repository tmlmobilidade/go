/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateYearPeriodDto, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { handleYearPeriodDateAssignment } from '../utils/handle-date-assignment.js';
import { haveSameAgencies } from '../utils/same-agencies.js';

/**
 * Updates an existing period by ID.
 * If dates are provided, merges with existing dates and handles conflicts by removing those dates from other periods of the same agency.
 * @param request Fastify request containing period ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateYearPeriodHandler(request: FastifyRequest<{ Body: UpdateYearPeriodDto, Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
	//

	//
	// Validate the client contract before permissions or assignment side effects.

	const validatedYearPeriod = UpdateYearPeriodSchema.safeParse(request.body);

	if (!validatedYearPeriod.success) {
		return sendErrorApiResponse(reply, {
			error: validatedYearPeriod.error.message,
			status_code: '400',
		});
	}

	//
	// Get the YearPeriod from the database

	const periodData = await goDb.offer.yearPeriods.findById(request.params.id);

	if (!periodData) {
		return sendErrorApiResponse(reply, {
			error: 'YearPeriod not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for year periods for the current user.

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.update);
	//
	// If no permission found, deny access

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update year periods',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for this period's agency

	if (!PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: periodData.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update these year periods.',
			status_code: '403',
		});
	}

	//
	// Authorize every submitted replacement agency before any writes.

	if (validatedYearPeriod.data.agency_ids && !PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: validatedYearPeriod.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update these agencies.',
			status_code: '403',
		});
	}

	//
	// If dates are provided, handle conflicts with other periods of the same agency

	const agenciesChanged = validatedYearPeriod.data.agency_ids && !haveSameAgencies(validatedYearPeriod.data.agency_ids, periodData.agency_ids);
	const reassignExistingDates = agenciesChanged && validatedYearPeriod.data.dates === undefined && periodData.dates?.length;

	if (validatedYearPeriod.data.dates?.length || reassignExistingDates) {
		const newDates = validatedYearPeriod.data.dates ?? [];
		const existingDates = periodData.dates || [];
		validatedYearPeriod.data.dates = await handleYearPeriodDateAssignment(
			validatedYearPeriod.data.agency_ids ?? periodData.agency_ids,
			newDates,
			request.me._id,
			periodData._id,
			existingDates,
		);
	}

	//
	// Update the period

	const updatedPeriod = await goDb.offer.yearPeriods.updateById(periodData._id, { ...validatedYearPeriod.data, updated_by: request.me._id });

	//
	// Send the updated period data as the response

	return sendSuccessApiResponse(reply, updatedPeriod);

	//
}
