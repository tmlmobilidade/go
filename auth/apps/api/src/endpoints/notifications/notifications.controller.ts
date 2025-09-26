/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { notifications } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type Notification } from '@tmlmobilidade/types';

/* * */

export class NotificationsController {
	/**
	 * Returns all Notifications sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Notification[]>) {
		const allNotifications = await notifications.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allNotifications, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns a Notification by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Notification>) {
		const notificationData = await notifications.findById(request.params.id);
		if (!notificationData) throw new HttpException(HttpStatus.NOT_FOUND, 'Notification not found');
		reply.send({ data: notificationData, error: null, statusCode: HttpStatus.OK });
	}

	//
}
