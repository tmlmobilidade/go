/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a holiday by ID
 * @param request Fastify request containing holiday ID in params
 * @param reply Fastify reply
 */
export async function lockHolidayHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Get the Holiday from the database

	const holidayData = await goDb.offer.holidays.findById(request.params.id);

	if (!holidayData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
	}

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.lock);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock holidays');
	}

	//
	// Validate that user has permission for ALL of this holiday's agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: holidayData.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock holiday. You must have permission for all agencies involved.');
	}

	// If authorized, toggle the lock status of the holiday
	await goDb.offer.holidays.updateOne({ _id: request.params.id }, { is_locked: !holidayData?.is_locked });
	const foundHoliday = await goDb.offer.holidays.findById(request.params.id);
	if (!foundHoliday) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
	}

	return reply.send({ data: foundHoliday, error: null, statusCode: HTTP_STATUS.OK });

	//
}
