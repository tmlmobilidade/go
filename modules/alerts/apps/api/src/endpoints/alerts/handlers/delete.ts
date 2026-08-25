/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a scheduled Alert from the database.
 * @param request The request object containing the alert ID in the params.
 * @param reply The reply object.
 */
export async function deleteAlert(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const deleteResult = await goDb.operation.alerts.deleteById(request.params.id);
	if (!deleteResult) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete alert');
	}

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
