/* * */

import { type FastifyRequest } from '@/types.js';

/**
 * Shared request attributes for Logger context.
 * Includes auth fields when authorization middleware has run.
 * Omits secrets (e.g. password_hash).
 */
export function getRequestLogContext(
	request: FastifyRequest,
	extra?: Record<string, unknown>,
): Record<string, unknown> {
	return {
		...extra,
		method: request.method,
		organization: request.organization
			? { _id: request.organization._id, long_name: request.organization.long_name, short_name: request.organization.short_name }
			: undefined,
		path: request.url,
		reqId: request.id,
		user: request.me
			? { _id: request.me._id, email: request.me.email, first_name: request.me.first_name, last_name: request.me.last_name, organization_id: request.me.organization_id }
			: undefined,
	};
}
