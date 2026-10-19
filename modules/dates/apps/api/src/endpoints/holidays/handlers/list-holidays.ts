/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all holidays.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listHolidaysHandler(request: FastifyRequest, reply: FastifyReply<Holiday[]>) {
	//

	//
	// Get the resource permissions for holidays for the current user.

	const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.read);

	//
	// If no permission found, deny access

	if (!userHolidayPermissions) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read holidays');
	}

	//
	// Build database query filters based on user permissions

	const queryFilters: Filter<Holiday> = {};

	//
	// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
	// filter holidays by those agency IDs.

	if ('resources' in userHolidayPermissions && 'agency_ids' in userHolidayPermissions.resources) {
		if (!userHolidayPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters.agency_ids = { $in: userHolidayPermissions.resources['agency_ids'] };
		}
	}

	//
	// Fetch holidays based on query filters

	const allHolidays = await goDb.offer.holidays.findMany(queryFilters);

	return reply.send({ data: allHolidays, error: null, statusCode: HTTP_STATUS.OK });

	//
}
