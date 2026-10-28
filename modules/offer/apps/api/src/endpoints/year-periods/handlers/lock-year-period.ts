/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a period by ID
 * @param request Fastify request containing period ID in params
 * @param reply Fastify reply
 */
export async function lockYearPeriodHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
	//

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

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.lock);
	//
	// If no permission found, deny access

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock/unlock year periods',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for this period's agency

	if (!PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: periodData.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to lock these year periods.',
			status_code: '403',
		});
	}

	//
	// Toggle the lock status of the period

	await goDb.offer.yearPeriods.updateOne({ _id: request.params.id }, { is_locked: !periodData.is_locked, updated_by: request.me._id });
	const updatedPeriod = await goDb.offer.yearPeriods.findById(request.params.id);
	if (!updatedPeriod) {
		return sendErrorApiResponse(reply, {
			error: 'YearPeriod not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, updatedPeriod);

	//
}
