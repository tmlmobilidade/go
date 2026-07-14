/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { type Plan } from '@tmlmobilidade/types';

/**
 * Reprocesses a plan by ID.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function controllerReprocessPlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	const planData = await goDB.operation.plans.findById(request.params.id);
	const result = await goDB.operation.plans.updateById(request.params.id, { apps: { ...planData.apps, controller: { last_hash: null, status: 'waiting', timestamp: null } } });
	return reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
}
