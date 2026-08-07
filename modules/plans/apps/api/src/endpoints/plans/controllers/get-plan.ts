/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog, type Plan } from '@tmlmobilidade/types';

/**
 * Retrieves a single plan by ID
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function getPlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Check if the user has permission to read the Plan

	const hasPermissionReadPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.agency_id,
	});

	if (!hasPermissionReadPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: read plan');

	//
	// Fetch the plan data

	return reply.send({
		data: planData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
