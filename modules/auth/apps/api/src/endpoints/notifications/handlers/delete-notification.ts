/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Delete one notification owned by the authenticated user.
 */
export async function deleteNotificationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const foundNotification = await goDb.core.notifications.findOne({
		_id: request.params.id,
		user_id: request.me._id,
	});

	if (!foundNotification) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Notification not found');

	await goDb.core.notifications.deleteOne({ _id: request.params.id, user_id: request.me._id });

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
