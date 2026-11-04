/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a period by ID
 * @param request Fastify request containing period ID in params
 * @param reply Fastify reply
 */
export async function deleteYearPeriodHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const { id } = request.params;
	const period = await goDb.offer.yearPeriods.findById(id);

	if (!period) {
		return sendErrorApiResponse(reply, {
			error: 'YearPeriod not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for periods for the current user.

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.delete);
	//
	// If no permission found, deny access

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete year periods',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for this period's agency

	if (!PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: period.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete these year periods.',
			status_code: '403',
		});
	}

	//

	await goDb.offer.yearPeriods.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
