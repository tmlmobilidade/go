/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Alert } from '@tmlmobilidade/go-types-operation';

/**
 * Duplicates an alert by ID.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function duplicateAlertHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
	//

	//
	// Retrieve the existing alert

	const existingAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });

	if (!existingAlert) {
		return sendErrorApiResponse(reply, {
			error: 'Original alert not found',
			status_code: '404',
		});
	}

	//
	// Insert the duplicated alert into the database
	// and send the duplicated alert to the client

	const insertResult = await goDb.operation.alerts.insertOne({
		...existingAlert,
		created_by: request.me._id,
		publish_status: 'draft',
		title: `${existingAlert.title} (Cópia)`,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, insertResult);
}
