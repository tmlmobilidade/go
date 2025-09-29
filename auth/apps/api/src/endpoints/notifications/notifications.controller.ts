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

	/**
	 * Marks a Notification as read.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async markAsRead(request: FastifyRequest<{ Body: Notification, Params: { id: string } }>, reply: FastifyReply<Notification>) {
		request.body.is_read = true;
		request.body.needs_email = false;

		console.log('Marking notification as read:', request.body);
		const updatedNotificationData = await notifications.updateById(request.params.id, request.body);
		reply.send({ data: updatedNotificationData, error: null, statusCode: HttpStatus.OK });
	}

	//
}
