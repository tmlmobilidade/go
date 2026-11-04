/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { populatePatternPath } from '@/utils/populate-pattern-path.js';
import { mergePatternWithEventRules } from '@/utils/rules.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { type Pattern } from '@tmlmobilidade/go-types-offer';

/**
 * Retrieves a single pattern by ID
 * @param request Fastify request containing pattern ID
 * @param reply Fastify reply
 */
export async function getPatternHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<PatternsDetail>) {
	//

	//
	// Get the Pattern from the database

	const patternData: null | Pattern = await goDb.offer.patterns.findById(request.params.id);

	if (!patternData) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}

	//
	// Get the resource permissions for patterns for the current user.

	const access = await authorizePatternAccess({ action: 'read', pattern: patternData, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	const merged = await mergePatternWithEventRules(patternData);

	//
	// Populate stop data for each path item

	if (patternData.path && patternData.path.length > 0) {
		const populatedPath = await populatePatternPath(patternData.path, stopIds =>
			goDb.infrastructure.stops.findMany({ _id: { $in: stopIds } }),
		);

		// Return pattern with populated path
		return sendSuccessApiResponse(reply, { ...merged, path: populatedPath });
	}

	//
	// Fetch the pattern data

	return sendSuccessApiResponse(reply, { ...merged, path: [] });

	//
}
