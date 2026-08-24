/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Notification } from '@tmlmobilidade/go-types-core';

/**
 * Retrieve the authenticated user's notifications.
 */
export async function listNotificationsHandler(request: FastifyRequest, reply: FastifyReply<Notification[]>) {
	const foundNotifications = await goDb.core.notifications.findMany(
		{ user_id: request.me._id },
		{ sort: { created_at: -1 } },
	);

	reply.send({ data: foundNotifications, error: null, statusCode: HTTP_STATUS.OK });
}
