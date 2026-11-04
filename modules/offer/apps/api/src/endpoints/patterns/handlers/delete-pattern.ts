/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a pattern by ID
 * @param request Fastify request containing pattern ID
 * @param reply Fastify reply
 */
export async function deletePatternHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const { id } = request.params;
	const pattern = await goDb.offer.patterns.findById(id);

	if (!pattern) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}

	//
	// Get the resource permissions for patterns for the current user.

	const access = await authorizePatternAccess({ action: 'delete', pattern: pattern, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	//

	await goDb.offer.patterns.deleteById(id);

	return sendSuccessApiResponse(reply, undefined);
}
