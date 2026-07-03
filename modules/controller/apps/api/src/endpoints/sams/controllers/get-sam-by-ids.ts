/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { sams, samsByIdsListViewAggregationPipeline } from '@tmlmobilidade/interfaces';
import { ActionsOf, Permission, PermissionCatalog, type SamListItem } from '@tmlmobilidade/types';

/* * */

export async function getSamByIds<S extends Permission['scope']>(request: FastifyRequest, reply: FastifyReply<SamListItem[]>, scope: S, action: ActionsOf<S>) {
	//
	// Resolve SAMs for stored favorite ids. `SamsPermission` has no `resources` today — treat missing
	// `agency_ids` like list batch default (no agency restriction). When resources exist, match rides.

	void scope;
	void action;

	const samsPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.sams.scope, PermissionCatalog.all.sams.actions.read);

	if (!samsPermission) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'Insufficient permissions.');
	}

	const agencyIds = (samsPermission as Permission & { resources?: { agency_ids?: string[] } }).resources?.agency_ids;
	const restrictByAgency = Array.isArray(agencyIds) && agencyIds.length > 0;
	const allowAllAgencies = !restrictByAgency || (agencyIds?.includes(PermissionCatalog.ALLOW_ALL_FLAG) ?? false);

	const numericIds = (request.query['ids']?.split(',') ?? [])
		.map(part => part.trim())
		.filter(Boolean)
		.map(Number)
		.filter(id => Number.isInteger(id));

	if (numericIds.length === 0) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ids parameter.');
	}

	const foundSamsByIds = (await sams.aggregate(
		samsByIdsListViewAggregationPipeline({
			agencyIds,
			ids: numericIds,
			restrictByAgency: !allowAllAgencies && Boolean(agencyIds?.length),
		}),
	)) as SamListItem[];

	return reply.send({ data: foundSamsByIds, error: null, statusCode: HTTP_STATUS.OK });
}
