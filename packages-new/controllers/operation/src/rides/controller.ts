/* * */

import { getRideById } from '@/rides/methods/get-ride-by-id.js';
import { getRides } from '@/rides/methods/get-rides.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type GetRidesBatchQuery, type Ride } from '@tmlmobilidade/go-types-operation';
import { type ActionsOf, type Permission } from '@tmlmobilidade/types';

/* * */

export class RidesSharedController {
	//

	/**
	 * Gets a batch of Rides built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static getRides = <S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<Ride[]>, scope: S, action: ActionsOf<S>) => getRides(request, reply, scope, action);

	/**
	 * Get a Ride by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static getRideById = <S extends Permission['scope']>(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Ride>, scope: S, action: ActionsOf<S>) => getRideById(request, reply, scope, action);
}
