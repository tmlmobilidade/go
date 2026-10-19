/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday, type UpdateHolidayDto } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing holiday by ID
 * @param request Fastify request containing holiday ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateHolidayHandler(request: FastifyRequest<{ Body: UpdateHolidayDto, Params: { id: string } }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Get the Holiday from the database

	const holidayData = await goDb.offer.holidays.findById(request.params.id);

	if (!holidayData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
	}

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.update);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update holidays');
	}

	//
	// Validate that user has permission for ALL of this holiday's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.update,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: holidayData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this holiday. You must have permission for all agencies involved.');
	}

	//
	// Update the holiday

	const updatedHoliday = await goDb.offer.holidays.updateById(holidayData._id, request.body);

	//
	// Send the updated holiday data as the response

	reply.send({
		data: updatedHoliday,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
