/* * */

import { generateComments } from '@/utils/comments.js';
import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Pattern, type UpdatePatternDto, UpdatePatternSchema } from '@tmlmobilidade/go-types-offer';

/**
 * Updates an existing pattern by ID
 * @param request Fastify request containing pattern ID and update data in body
 * @param reply Fastify reply
 */
export async function updatePatternHandler(request: FastifyRequest<{ Body: UpdatePatternDto, Params: { id: string } }>, reply: FastifyReply<Pattern>) {
	//
	// Validate client-owned fields before accessing storage.

	const validatedPattern = UpdatePatternSchema.safeParse(request.body);
	if (!validatedPattern.success) {
		return sendErrorApiResponse(reply, { error: validatedPattern.error.message, status_code: '400' });
	}

	//

	//
	// Get the Pattern from the database

	const patternData = await goDb.offer.patterns.findById(request.params.id);

	if (!patternData) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}

	//
	// Get the resource permissions for patterns for the current user.

	const access = await authorizePatternAccess({ action: 'update', pattern: patternData, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	// Ordinary edits cannot move a pattern to a different parent hierarchy.
	if ((validatedPattern.data.line_id !== undefined && validatedPattern.data.line_id !== patternData.line_id) || (validatedPattern.data.route_id !== undefined && validatedPattern.data.route_id !== patternData.route_id)) {
		return sendErrorApiResponse(reply, { error: 'Pattern parent changes require a dedicated move operation', status_code: '409' });
	}

	const sanitizedBody = validatedPattern.data;

	//
	// Generate activity comments
	const patternComments = generateComments(
		patternData,
		sanitizedBody,
		{
			excludeFields: ['comments', 'updated_at', 'updated_by'],
			updatedBy: request.me.first_name + ' ' + request.me.last_name,
		},
	);

	// Merge with existing comments
	const updateData = {
		...sanitizedBody,
		comments: [
			...(patternData.comments || []),
			...patternComments,
		],
		updated_by: request.me._id,
	};

	//
	// Update the pattern

	const updatedPattern = await goDb.offer.patterns.updateOne({ _id: patternData._id }, updateData);

	//
	// Send the updated pattern data as the response

	return sendSuccessApiResponse(reply, updatedPattern);

	//
}
