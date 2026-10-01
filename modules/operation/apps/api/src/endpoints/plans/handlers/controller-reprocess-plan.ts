/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { setPlanStatus } from '@tmlmobilidade/go-operation-pckg-utils';
import { type Plan } from '@tmlmobilidade/go-types-operation';

/**
 * Reprocesses a plan by ID.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function controllerReprocessPlanHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Update the plan data

	await setPlanStatus(request.params.id, 'rides_feeder', 'waiting');

	const updatedPlan = await goDb.operation.plans.findById(request.params.id);

	//
	// Return the success response

	return sendSuccessApiResponse(reply, updatedPlan);
}
