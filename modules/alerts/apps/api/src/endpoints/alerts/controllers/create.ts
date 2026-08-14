/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert, CreateAlertDto } from '@tmlmobilidade/go-types-operation';

/**
 * Insert a new scheduled Alert into the database.
 * @param request The request object containing the alert data in the body.
 * @param reply The reply object.
 */
export async function create(request: FastifyRequest<{ Body: CreateAlertDto }>, reply: FastifyReply<Alert>) {
	const insertResult = await goDb.operation.alerts.insertOne({ ...request.body, created_by: request.me._id, updated_by: request.me._id });
	if (!insertResult) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create alert');
	}

	// await notifications.sendNotification(PermissionCatalog.all.alerts.scope, 'created_alert', request.me, insertResult._id, insertResult.title, insertResult.description);
	reply.send({ data: insertResult, error: null, statusCode: HTTP_STATUS.CREATED }).status(HTTP_STATUS.CREATED);
}
