/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { notifications } from '@tmlmobilidade/interfaces';
import { type Notification } from '@tmlmobilidade/types';

/* * */

export class NotificationsController {
	/**
	* Delete a notification - Delete a notification from the database
 	* @param {FastifyRequest} request - The request object
	* @param {FastifyReply} reply - The reply object
	*/
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<string>) {
		await notifications.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns all Notifications sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Notification[]>) {
		const allNotifications = await notifications.findMany({ user_id: request.me._id }, { sort: { _id: 1 } });
		reply.send({ data: allNotifications, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns a Notification by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Notification>) {
		const notificationData = await notifications.findById(request.params.id);
		if (!notificationData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Notification not found');
		reply.send({ data: notificationData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Marks a Notification as read.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async markAsRead(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Notification>) {
		const updatedNotificationData = await notifications.updateById(request.params.id, { is_read: true });
		reply.send({ data: updatedNotificationData, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
