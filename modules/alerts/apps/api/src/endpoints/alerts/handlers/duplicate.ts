/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert, CreateAlertSchema } from '@tmlmobilidade/go-types-operation';

/**
 * Duplicates an alert by ID.
 * @param request Fastify request containing alert ID in params.
 * @param reply Fastify reply.
 */
export async function duplicate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Alert>) {
	// Retrieve the existing alert
	const existingAlert = await goDb.operation.alerts.findOne({ _id: request.params.id });
	if (!existingAlert) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Alert not found');
	}

	// Update necessary properties to indicate a copy
	const duplicatedAlertData = CreateAlertSchema.parse({
		...existingAlert,
		created_by: request.me._id,
		publish_status: 'draft',
		title: `${existingAlert.title} (Cópia)`,
		updated_by: request.me._id,
	});
	// Insert the duplicated alert into the database
	// and send the duplicated alert to the client
	const insertResult = await goDb.operation.alerts.insertOne(duplicatedAlertData);

	reply.send({ data: insertResult, error: null, statusCode: HTTP_STATUS.OK });
}
