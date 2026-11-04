/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreatePatternDto, CreatePatternSchema, type Pattern, type StopsParameter } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';

/**
 * Creates a new pattern.
 * @param request Fastify request containing pattern data in body
 * @param reply Fastify reply
 */
export async function createPatternHandler(request: FastifyRequest<{ Body: CreatePatternDto }>, reply: FastifyReply<Pattern>) {
	//
	// Validate client-owned fields before accessing storage.

	const validatedPattern = CreatePatternSchema.safeParse(request.body);
	if (!validatedPattern.success) {
		return sendErrorApiResponse(reply, { error: validatedPattern.error.message, status_code: '400' });
	}

	//

	//
	// Get the resource permissions for patterns for the current user.

	const access = await authorizePatternAccess({ action: 'create', pattern: { ...validatedPattern.data, is_locked: false }, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	//
	// Create the new pattern, always seeding an empty default parameters entry

	const defaultParameter: StopsParameter = {
		_id: generateRandomString({ length: 5 }),
		kind: 'default',
		path: [],
	};

	const newPattern = await goDb.offer.patterns.insertOne({
		...validatedPattern.data,
		comments: [],
		created_by: request.me._id,
		is_locked: false,
		parameters: [defaultParameter],
		updated_by: request.me._id,
	});

	//
	// Send the response

	return sendSuccessApiResponse(reply, newPattern);

	//
}
