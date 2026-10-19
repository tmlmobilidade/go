/* * */

import { type FastifyInstance } from '@/types.js';

import { setupDecodeIdParamHook } from './decode-id-param.js';
import { setupErrorHandler } from './error-handler.js';
import { setupLogCompletedRequestHook } from './log-completed-request.js';

/**
 * Registers Fastify hooks for request decoding, request logging and errors.
 */
export function setupHooks(
	server: FastifyInstance,
	getModuleName: () => string | undefined,
): void {
	setupDecodeIdParamHook(server);
	setupLogCompletedRequestHook(server, getModuleName);
	setupErrorHandler(server, getModuleName);
}
