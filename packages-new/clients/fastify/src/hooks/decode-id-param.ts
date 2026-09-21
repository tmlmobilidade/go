/* * */

import { type FastifyInstance } from '@/types.js';

/**
 * Decodes URI-encoded `id` path params so encoded slashes (e.g. `%2F`) are
 * available as literal characters in route handlers.
 */
export function setupDecodeIdParamHook(server: FastifyInstance): void {
	server.addHook('preHandler', (request, _, done) => {
		const params = request.params as { id?: string };
		if (params.id !== undefined) {
			try {
				params.id = decodeURIComponent(params.id);
			} catch {
				// Malformed URI sequence — keep original value
			}
		}
		done();
	});
}
