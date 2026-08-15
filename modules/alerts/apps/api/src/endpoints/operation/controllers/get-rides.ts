/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { getOperationRidesList, type OperationRidesListFilters, type OperationRidesListItem } from '@tmlmobilidade/go-alerts-pckg-queries';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRides(request: FastifyRequest<{ Body: OperationRidesListFilters }>, reply: FastifyReply<OperationRidesListItem[]>) {
	//

	//
	// Fetch the rides data by query
	// and send it back to the client

	const result = await getOperationRidesList(request.body);

	reply.send({
		data: result,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
