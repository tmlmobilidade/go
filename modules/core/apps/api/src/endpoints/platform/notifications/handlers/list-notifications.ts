/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';

/**
 * List the notifications for the current user.
 * @param request The request object.
 * @param reply The reply object.
*/
export async function listNotificationsHandler(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	return sendErrorApiResponse(reply, {
		error: 'Notifications not implemented.',
		status_code: '404',
	});
}
