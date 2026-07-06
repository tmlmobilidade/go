/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { agencies, type Filter } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type ActionsOf, type Agency, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

interface GetAllAgenciesQuery {
	actions?: string | string[]
	scope?: Permission['scope']
}

type AgencyScopedPermission = Permission & {
	resources?: {
		agency_ids?: string[]
	}
};

function getAgencyIdsFromPermission(permission: Permission | undefined): string[] {
	return (permission as AgencyScopedPermission | undefined)?.resources?.agency_ids ?? [];
}

/* * */

export class AgenciesSharedController {
	//

	/**
	 * Returns all Agencies sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest<{ Querystring: GetAllAgenciesQuery }>, reply: FastifyReply<Agency[]>) {
		//
		// A. Setup variables

		const scope = request.query.scope;
		const actions = (Array.isArray(request.query.actions) ? request.query.actions : request.query.actions?.split(','))?.filter(Boolean);

		if (!scope || !actions?.length) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing scope or actions query parameters');
		}

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const permittedAgencyIds = actions.flatMap(action => getAgencyIdsFromPermission(
			PermissionCatalog.get(request.permissions, scope, action as ActionsOf<typeof scope>),
		));

		if (!permittedAgencyIds.length) {
			Logger.issue({
				context: {
					action: 'getAll',
					feature: 'agencies',
					request,
				},
				level: 'info',
				messageOrError: 'No agency_ids found in permissions',
			});
			return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });
		}

		const allowAllAgencies = permittedAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);
		const queryFilters: Filter<Agency> = allowAllAgencies ? {} : { _id: { $in: permittedAgencyIds } };

		const allAgencies = await agencies.findMany(queryFilters, { sort: { _id: 1 } });
		reply.send({ data: allAgencies, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById<S extends Permission['scope']>(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>, scope: S, action: ActionsOf<S>) {
		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const agenciesPermission = PermissionCatalog.get(request.permissions, scope, action);
		const permittedAgencyIds = getAgencyIdsFromPermission(agenciesPermission);

		if (!permittedAgencyIds.length) {
			Logger.issue({
				context: {
					action: 'getById',
					feature: 'agencies',
					request,
					value: request.params.id,
				},
				level: 'info',
				messageOrError: 'No agency_ids found in permissions',
			});
			return reply.send({ data: null, error: null, statusCode: HTTP_STATUS.OK });
		}

		const allowAllAgencies = permittedAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);
		const queryFilters: Filter<Agency> = allowAllAgencies ? { _id: request.params.id } : { _id: { $eq: request.params.id, $in: permittedAgencyIds } };

		const agencyData = await agencies.findOne(queryFilters);

		if (!agencyData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
			Logger.issue({
				context: {
					action: 'getById',
					feature: 'agencies',
					request,
					value: request.params.id,
				},
				level: 'error',
				messageOrError: error,
			});
			throw error;
		}

		reply.send({ data: agencyData, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
