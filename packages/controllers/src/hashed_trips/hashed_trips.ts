import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { hashedTrips } from '@tmlmobilidade/interfaces';
import { type HashedTrip } from '@tmlmobilidade/types';

export class HashedTripsSharedController {
	//

	/**
	 * Gets a HashedTrip by id.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HashedTrip>) {
		//
		// Get a hashed trip by id

		const hashedTrip = await hashedTrips.findById(request.params.id) as HashedTrip;

		//
		// Send the response

		reply.send({ data: hashedTrip, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	//
}
