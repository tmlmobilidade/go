/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Updates an Alert in the database
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAlertHandler(request: FastifyRequest<{ Body: UpdateAlertDto, Params: { id: string } }>, reply: FastifyReply<Alert>) {
	//

	//
	// Validate the request body

	const validatedAlert = UpdateAlertSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedAlert.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAlert.error.message,
			status_code: '400',
		});
	}

	//
	// Update the alert in the database

	const updatedAlertData = await goDb.operation.alerts.updateById(request.params.id, validatedAlert.data);

	return sendSuccessApiResponse(reply, updatedAlertData);
}
