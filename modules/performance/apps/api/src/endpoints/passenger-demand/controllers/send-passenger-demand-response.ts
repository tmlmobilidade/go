/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function sendPassengerDemandResponse<T>(
	reply: FastifyReply<T>,
	queryName: string,
	query: () => Promise<T>,
) {
	try {
		return reply.send({
			data: await query(),
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	} catch (error) {
		Logger.error({ error, message: `Error executing passenger-demand ${queryName} query` });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to retrieve passenger-demand ${queryName}`);
	}
}

/* * */
