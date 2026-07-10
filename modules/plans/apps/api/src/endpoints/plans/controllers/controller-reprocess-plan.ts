/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { plans } from '@tmlmobilidade/interfaces';
import { type Plan } from '@tmlmobilidade/types';

/**
 * Reprocesses a plan by ID.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function controllerReprocessPlan(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	const planData = await plans.findById(request.params.id);
	const result = await plans.updateById(request.params.id, { apps: { ...planData.apps, controller: { last_hash: null, status: 'waiting', timestamp: null } } });
	return reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
}
