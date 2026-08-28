/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';

/**
 * Reprocesses a plan by ID.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function controllerReprocessPlanHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Get the plan data

	const planData = await goDb.operation.plans.findById(request.params.id);

	//
	// Update the plan data
	const result = await goDb.operation.plans.updateById(request.params.id, { apps: { ...planData.apps, controller: { last_hash: null, status: 'waiting', timestamp: null } } });

	//
	// Return the success response

	return sendSuccessApiResponse(reply, result);
}
