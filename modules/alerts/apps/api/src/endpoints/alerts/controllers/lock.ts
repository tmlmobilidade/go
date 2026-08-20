/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert } from '@tmlmobilidade/go-types-operation';

/**
 * Toggles the lock status of an alert by ID.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
	const foundAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	if (!foundAlert) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
	await goDb.operation.alerts.updateOne({ _id: request.params.id }, { is_locked: !foundAlert.is_locked });
	const updatedAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	if (!updatedAlert) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to toggle lock status for alert');
	reply.send({ data: updatedAlert, error: null, statusCode: HTTP_STATUS.OK });
}
