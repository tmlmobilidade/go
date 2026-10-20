/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes a holiday by ID
 * @param request Fastify request containing holiday ID in params
 * @param reply Fastify reply
 */
export async function deleteHolidayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	const { id } = request.params;
	const holiday = await goDb.offer.holidays.findById(id);

	if (!holiday) {
		return sendErrorApiResponse(reply, {
			error: 'Holiday not found',
			status_code: '404',
		});
	}

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.delete);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete holidays',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL of this holiday's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: holiday.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete this holiday. You must have permission for all agencies involved.',
			status_code: '403',
		});
	}

	//

	await goDb.offer.holidays.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
