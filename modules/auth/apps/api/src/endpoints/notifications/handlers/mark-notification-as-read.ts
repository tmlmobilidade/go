/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Notification } from '@tmlmobilidade/go-types-core';

/**
 * Mark one notification owned by the authenticated user as read.
 */
export async function markNotificationAsReadHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Notification>) {
	const foundNotification = await goDb.core.notifications.findOne({
		_id: request.params.id,
		user_id: request.me._id,
	});

	if (!foundNotification) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Notification not found');

	const updatedNotification = await goDb.core.notifications.updateOne(
		{ _id: request.params.id, user_id: request.me._id },
		{ is_read: true, updated_by: request.me._id },
	);

	reply.send({ data: updatedNotification, error: null, statusCode: HTTP_STATUS.OK });
}
