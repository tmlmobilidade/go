/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlanListFilters } from '@tmlmobilidade/go-plans-pckg-types';
import { Plan } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves all plans.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getAllPlans(request: FastifyRequest<{ Body: PlanListFilters }>, reply: FastifyReply<Plan[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.plans.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		values: request.body.agency_ids,
	});

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
			queryFilters['agency_id'] = { $in: userPlanPermissions.resources['agency_ids'] };
		}
	}

	if ('resources' in userPlanPermissions) {
		const filters = {
			...(userPlanPermissions.resources['agency_ids'] && !userPlanPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG) && { agency_id: { $in: userPlanPermissions.resources['agency_ids'] } }),
		};

		const filteredPlans = await goDb.operation.plans.findMany(filters, { sort: { created_at: -1 } });

		if (!filteredPlans) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plans not found');
		}

		return reply.send({ data: filteredPlans, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
	// If no specific permissions are set, return all plans

	const allPlans = await goDb.operation.plans.findMany({}, { sort: { created_at: -1 } });

	return reply.send({ data: allPlans, error: null, statusCode: HTTP_STATUS.OK });
}
