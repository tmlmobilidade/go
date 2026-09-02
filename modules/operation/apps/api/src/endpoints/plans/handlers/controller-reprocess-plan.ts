/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Reprocesses a plan by ID.
 * @param request Fastify request containing plan ID in params
 * @param reply Fastify reply
 */
export async function controllerReprocessPlanHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Plan>) {
	//

	//
	// Update the plan data

	const plansCollection = await goDb.operation.plans.getCollection();

	const updateResult = await plansCollection.findOneAndUpdate(
		{ _id: { $eq: request.params.id } },
		{
			$set: {
				'apps.rides_feeder.last_hash': null,
				'apps.rides_feeder.status': 'waiting',
				'apps.rides_feeder.timestamp': Dates.now('utc').unix_milliseconds,
			},
		});

	//
	// Return the success response

	return sendSuccessApiResponse(reply, updateResult);
}
