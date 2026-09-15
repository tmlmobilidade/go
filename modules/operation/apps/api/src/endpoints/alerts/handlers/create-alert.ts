/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert, type CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Insert a new scheduled Alert into the database.
 * @param request The request object containing the alert data in the body.
 * @param reply The reply object.
 */
export async function createAlertHandler(request: FastifyRequest<{ Body: CreateAlertDto }>, reply: FastifyReply<Alert>) {
	//

	//
	// Validate the request body

	const validatedAlert = CreateAlertSchema.safeParse(request.body);

	if (!validatedAlert.success) {
		return sendErrorApiResponse(reply, {
			error: validatedAlert.error.message,
			status_code: '400',
		});
	}

	//
	// Insert the alert into the database

	const insertResult = await goDb.operation.alerts.insertOne({ ...validatedAlert.data, created_by: request.me._id, updated_by: request.me._id });

	if (!insertResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to create alert',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, insertResult, { status_code: '201' });
}
