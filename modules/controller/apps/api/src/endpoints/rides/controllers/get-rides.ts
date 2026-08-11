/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ridesProvider } from '@tmlmobilidade/go-providers-operation';
import { type GetRidesQuery, type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRides(request: FastifyRequest<{ Body: GetRidesQuery }>, reply: FastifyReply<Ride[]>) {
	//

	//
	// Fetch the rides data by query
	// and send it back to the client

	console.log('request.body', request.body);

	const ridesData = await ridesProvider.findRidesByQuery(request.body);

	console.log('ridesData', ridesData);

	reply.send({
		data: ridesData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
