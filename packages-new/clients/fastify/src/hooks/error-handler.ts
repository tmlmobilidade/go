/* * */

import { sendErrorApiResponse } from '@/response/error-response.js';
import { type FastifyInstance } from '@/types.js';
import { HttpException } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Global error handler: log via Logger and return a consistent HTTP error body.
 */
export function setupErrorHandler(server: FastifyInstance, getModuleName: () => string | undefined): void {
	server.setErrorHandler((error, request, reply) => {
		Logger.error({
			contextOrErrorOrSpacesAfter: {
				method: request.method,
				module: getModuleName(),
				path: request.url,
				reqId: request.id,
			},
			error: error instanceof Error ? error : undefined,
			message: error instanceof Error ? error.message : 'Unhandled error',
		});

		if (error instanceof HttpException) {
			reply.status(error.statusCode).send({ data: undefined, error: error.message, statusCode: error.statusCode });
			return;
		}

		return sendErrorApiResponse(reply, { error: 'Internal server error', status_code: '500' });
	});
}
