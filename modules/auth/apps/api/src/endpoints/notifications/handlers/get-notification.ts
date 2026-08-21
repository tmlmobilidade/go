/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Notification } from '@tmlmobilidade/go-types-core';

/**
 * Retrieve one notification owned by the authenticated user.
 */
export async function getNotificationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Notification>) {
	const foundNotification = await goDb.core.notifications.findOne({
		_id: request.params.id,
		user_id: request.me._id,
	});

	if (!foundNotification) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Notification not found');

	reply.send({ data: foundNotification, error: null, statusCode: HTTP_STATUS.OK });
}
