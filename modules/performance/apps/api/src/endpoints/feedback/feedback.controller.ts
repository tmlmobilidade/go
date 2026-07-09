/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { type PublicFeedback } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export class FeedbackController {
	static async getPreview(request: FastifyRequest, reply: FastifyReply<PublicFeedback[]>) {
		try {
			const clickhouseClient = await GOClickHouseClient.getClient();
			const resultSet = await clickhouseClient.query({
				format: 'JSONEachRow',
				query: 'SELECT * FROM `hub`.`feedback` ORDER BY `created_at` DESC',
			});
			const rows = await resultSet.json<PublicFeedback>();

			reply.send({
				data: rows,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving feedback preview' });
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve feedback preview');
		}
	}
}
