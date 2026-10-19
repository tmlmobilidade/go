/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
	}

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.read);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read holidays');
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
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this holiday');
	}

	//
	// Fetch the holiday data

	return reply.send({
		data: holidayData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});

	//
}
