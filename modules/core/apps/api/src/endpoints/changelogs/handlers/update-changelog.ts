/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Changelog, type UpdateChangelogDto, UpdateChangelogSchema } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * Update changelog content and publication status.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function updateChangelogHandler(request: FastifyRequest<{ Body: UpdateChangelogDto, Params: { id: string } }>, reply: FastifyReply<Changelog>) {
	//

	//
	// Validate the requested content and optional publication status

	const validated = UpdateChangelogSchema.safeParse(request.body);

	if (!validated.success) {
		return sendErrorApiResponse(reply, {
			error: validated.error.message,
			status_code: '400',
		});
	}

	const patch = validated.data;

	//
	// Find the current document and reject changes to locked content

	const previous = await goDb.core.changelogs.findById(request.params.id);

	if (!previous) {
		return sendErrorApiResponse(reply, {
			error: 'Release not found',
			status_code: '404',
		});
	}

	if (previous.is_locked) {
		return sendErrorApiResponse(reply, {
			error: 'Release is locked',
			status_code: '409',
		});
	}

	//
	// Update the editable fields

	const updated = await goDb.core.changelogs.updateOne({ _id: request.params.id }, {
		...patch,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, updated);
}
