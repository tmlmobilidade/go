/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves a single holiday by ID
 * @param request Fastify request containing holiday ID in params
 * @param reply Fastify reply
 */
export async function getHolidayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Holiday>) {
	//

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

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.read);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read holidays',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for at least one of this holiday's agencies

	const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.holidays.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: holidayData.agency_ids,
	});

	if (!hasPermissionForAnyAgency) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read this holiday',
			status_code: '403',
		});
	}

	//
	// Fetch the holiday data

	return sendSuccessApiResponse(reply, holidayData);

	//
}
