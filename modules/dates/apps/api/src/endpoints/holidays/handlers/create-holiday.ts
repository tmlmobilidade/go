/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateHolidayDto, type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new holiday.
 * @param request Fastify request containing holiday data
 * @param reply Fastify reply
 */
export async function createHolidayHandler(request: FastifyRequest<{ Body: CreateHolidayDto }>, reply: FastifyReply<Holiday>) {
	//

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.create);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create holidays');
	}

	//
	// Validate that user has permission for ALL the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.holidays.actions.create,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: request.body.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create holidays for these agencies. You must have permission for all agencies involved.');
	}

	//
	// Create the new holiday

	const newHoliday = await goDb.offer.holidays.insertOne({
		...request.body,
		created_by: request.me._id,
	});

	//
	// Send the response

	reply.send({ data: newHoliday, error: null, statusCode: HTTP_STATUS.OK });

	//
}
