/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { getOperationLinesList, type OperationLinesListFilters, type OperationLinesListItem } from '@tmlmobilidade/go-alerts-pckg-types';

/**
 * Get lines by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getLines(request: FastifyRequest<{ Body: OperationLinesListFilters }>, reply: FastifyReply<OperationLinesListItem[]>) {
	//

	//
	// Fetch the lines data by query
	// and send it back to the client

	const result = await getOperationLinesList(request.body);

	reply.send({
		data: result,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
