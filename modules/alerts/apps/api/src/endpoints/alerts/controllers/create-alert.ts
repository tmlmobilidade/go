/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert, type CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Insert a new scheduled Alert into the database.
 * @param request The request object containing the alert data in the body.
 * @param reply The reply object.
 */
export async function createAlert(request: FastifyRequest<{ Body: CreateAlertDto }>, reply: FastifyReply<Alert>) {
	const validatedAlert = CreateAlertSchema.parse(request.body);
	const insertResult = await goDb.operation.alerts.insertOne({ ...validatedAlert, created_by: request.me._id, updated_by: request.me._id });
	if (!insertResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to create alert',
			status_code: '500',
		});
	}
	return sendSuccessApiResponse(reply, insertResult, { status_code: '201' });
}
