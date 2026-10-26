/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Pattern } from '@tmlmobilidade/go-types-offer';

/**
 * Toggles the lock status of a pattern by ID
 * @param request Fastify request containing pattern ID
 * @param reply Fastify reply
 */
export async function lockPatternHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Pattern>) {
	//

	//
	// Get the Pattern from the database

	const patternData = await goDb.offer.patterns.findById(request.params.id);

	if (!patternData) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}

	//
	// Get the resource permissions for patterns for the current user.

	const access = await authorizePatternAccess({ action: 'lock', pattern: patternData, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	// If authorized, toggle the lock status of the pattern
	await goDb.offer.patterns.updateOne({ _id: request.params.id }, { is_locked: !patternData.is_locked, updated_by: request.me._id });
	const foundPattern = await goDb.offer.patterns.findById(request.params.id);
	if (!foundPattern) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}

	return sendSuccessApiResponse(reply, foundPattern);

	//
}
