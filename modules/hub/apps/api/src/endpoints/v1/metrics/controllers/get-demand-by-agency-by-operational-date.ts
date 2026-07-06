/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the demand by agency by operational date JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getDemandByAgencyByOperationalDate(request: FastifyRequest, reply: FastifyReply<DemandByAgencyByOperationalDate>) {
	const raw = await apiCache.get('hub:v1:metrics:demand:by-agency:by-operational-date:json');
	if (!raw) {
		Logger.error({ message: '[hub/v1/metrics:getDemandByAgencyByOperationalDate()] No data in cache.' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=15')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	}
	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=15')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(raw),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
