/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert } from '@tmlmobilidade/go-types-operation';

/**
 * Returns an Alert by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	// If the alert does not exist, return an error
	if (!foundAlert) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
	}

	reply.send({ data: foundAlert, error: null, statusCode: HTTP_STATUS.OK });
}
