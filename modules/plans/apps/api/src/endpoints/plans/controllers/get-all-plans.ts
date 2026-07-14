/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { type Filter } from '@tmlmobilidade/interfaces';
import { PermissionCatalog, type Plan } from '@tmlmobilidade/types';

/**
 * Retrieves all plans.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getAllPlans(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
	//

	//
	// Get the resource permissions for
	// GTFS Validations for the current user.

	const userPlanPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.read);

	//
	// If specific agency permissions are set,
	// setup the database filters accordingly.

	const queryFilters: Filter<Plan> = {};

	//
	// If agency IDs are specified and do not include the ALLOW_ALL_FLAG,
	// filter validations by those agency IDs.

	if ('resources' in userPlanPermissions && 'agency_ids' in userPlanPermissions.resources) {
		if (!userPlanPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters['gtfs_agency.agency_id'] = { $in: userPlanPermissions.resources['agency_ids'] };
		}
	}

	if ('resources' in userPlanPermissions) {
		const filters = {
			...(userPlanPermissions.resources['agency_ids'] && !userPlanPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG) && { 'gtfs_agency.agency_id': { $in: userPlanPermissions.resources['agency_ids'] } }),
		};

		const filteredPlans = await goDB.operation.plans.findMany(filters, { sort: { created_at: -1 } });

		if (!filteredPlans) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plans not found');
		}

		return reply.send({ data: filteredPlans, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
	// If no specific permissions are set, return all plans

	const allPlans = await goDB.operation.plans.findMany({}, { sort: { created_at: -1 } });

	return reply.send({ data: allPlans, error: null, statusCode: HTTP_STATUS.OK });
}
