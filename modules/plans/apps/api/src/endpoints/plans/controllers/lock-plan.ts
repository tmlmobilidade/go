/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Plan } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Toggles the lock status of a plan by ID.
 * @param request Fastify request containing plan ID in params.
 * @param reply Fastify reply.
 */
export async function lockPlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the Plan from the database

	const planData = await goDb.operation.plans.findById(request.params.id);

	if (!planData) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to toggle lock the Plan

	const hasPermissionToggleLockPlan = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.lock,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planData.agency_id,
	});

	if (!hasPermissionToggleLockPlan) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to perform this action: toggle lock plan',
			status_code: '403',
		});
	}

	//
	// If authorized, toggle the lock status of the plan

	await goDb.operation.plans.toggleLockById(request.params.id);

	const foundPlan = await goDb.operation.plans.findById(request.params.id);

	if (!foundPlan) {
		return sendErrorApiResponse(reply, {
			error: `Plan with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	//
	// Return the success response

	return sendSuccessApiResponse(reply, foundPlan);
}
