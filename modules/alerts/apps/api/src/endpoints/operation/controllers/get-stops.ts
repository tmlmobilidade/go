/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { getOperationStopsList, type OperationStopsListFilters, type OperationStopsListItem } from '@tmlmobilidade/go-alerts-pckg-queries';

/**
 * Get stops by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getStops(request: FastifyRequest<{ Body: OperationStopsListFilters }>, reply: FastifyReply<OperationStopsListItem[]>) {
	//

	//
	// Fetch the stops data by query
	// and send it back to the client

	const result = await getOperationStopsList(request.body);

	reply.send({
		data: result,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
