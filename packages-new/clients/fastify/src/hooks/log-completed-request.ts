/* * */

import { IS_DEV } from '@/logger/is-dev.js';
import { type FastifyInstance } from '@/types.js';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Non-dev: emit one OTel JSON line per completed request via Logger.
 */
export function setupLogCompletedRequestHook(server: FastifyInstance, getModuleName: () => string | undefined): void {
	if (IS_DEV) return;

	server.addHook('onResponse', (request, reply, done) => {
		Logger.info({
			contextOrSpacesAfter: {
				method: request.method,
				module: getModuleName(),
				path: request.url,
				reqId: request.id,
				status: reply.statusCode,
			},
			message: 'request completed',
		});
		done();
	});
}
