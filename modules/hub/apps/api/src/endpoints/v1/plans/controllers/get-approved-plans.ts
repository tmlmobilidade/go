/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';

/**
 * Retrieves all plans that are approved together with the URL to the operation file
 * This method is used to fetch plans that are ready for use in the system.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getApprovedPlans(request: FastifyRequest, reply: FastifyReply<Plan[]>) {
	//

	const cachedData = await apiCache.get('hub:v1:plans:approved:json');

	if (!cachedData) {
		Logger.error('[hub/v1/plans:getApprovedPlans()] No cached data found for approved plans');
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=300')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	};

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=300')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
