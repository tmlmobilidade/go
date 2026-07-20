/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { plans } from '@tmlmobilidade/interfaces';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Deletes an plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function deletePlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	if (!request.params?.id) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing Plan ID in request params.');

	const foundPlan = await plans.findById(request.params.id);

	if (!foundPlan) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found.');

	//
	// Check if the user has permission to delete a plan

	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.delete,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: foundPlan.gtfs_agency.agency_id,
	})) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: delete plan');
	}

	//
	// Actually delete the plan

	await plans.deleteById(request.params.id);

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
