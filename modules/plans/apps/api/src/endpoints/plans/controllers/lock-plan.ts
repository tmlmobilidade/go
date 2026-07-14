/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { PermissionCatalog, type Plan } from '@tmlmobilidade/types';

/**
 * Toggles the lock status of a plan by ID.
 * @param request Fastify request containing plan ID in params.
 * @param reply Fastify reply.
 */
export async function lockPlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDB.operation.plans.findById(request.params.id);

	if (!planData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	//
	// Check if the user has permission to toggle lock the Plan

	const hasPermissionToggleLockPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.gtfs_agency.agency_id,
	});

	if (!hasPermissionToggleLockPlan) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock plan');

	//
	// If authorized, toggle the lock status of the plan

	await goDB.operation.plans.toggleLockById(request.params.id);

	const foundPlan = await goDB.operation.plans.findById(request.params.id);

	if (!foundPlan) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Plan not found');

	reply.send({ data: foundPlan, error: null, statusCode: HTTP_STATUS.OK });
}
