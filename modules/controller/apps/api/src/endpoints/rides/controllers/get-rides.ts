/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type ControllerRidesListFilters, type ControllerRidesListItem, getControllerRidesList } from '@tmlmobilidade/go-controller-pckg-queries';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRides(request: FastifyRequest<{ Body: ControllerRidesListFilters }>, reply: FastifyReply<ControllerRidesListItem[]>) {
	//

	//
	// Fetch the rides data by query
	// and send it back to the client

	const result = await getControllerRidesList(request.body);

	console.log('result', result);

	reply.send({
		data: result,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
