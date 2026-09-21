/* * */

import { getRequestLogContext } from '@/hooks/request-log-context.js';
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
			contextOrSpacesAfter: getRequestLogContext(request, { module: getModuleName(), status: reply.statusCode }),
			message: 'request completed',
		});
		done();
	});
}
