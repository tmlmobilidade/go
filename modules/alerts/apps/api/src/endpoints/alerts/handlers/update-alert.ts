/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert, UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Updates an Alert in the database
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAlertHandler(request: FastifyRequest<{ Body: UpdateAlertDto, Params: { id: string } }>, reply: FastifyReply<Alert>) {
	// Validate the request body
	const validatedAlert = UpdateAlertSchema.safeParse(request.body);
	if (!validatedAlert.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Dados inválidos', validatedAlert.error);
	}

	// Update the alert in the database
	const updatedAlertData = await goDb.operation.alerts.updateOne({ _id: request.params.id }, validatedAlert.data);

	reply.send({ data: updatedAlertData, error: null, statusCode: HTTP_STATUS.OK });
}
