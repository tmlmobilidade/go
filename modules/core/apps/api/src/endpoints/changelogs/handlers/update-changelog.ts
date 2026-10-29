/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Changelog, ChangelogSchema, type UpdateChangelogDto, UpdateChangelogSchema } from '@tmlmobilidade/go-types-core';

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

	let patch: UpdateChangelogDto;

	try {
		patch = UpdateChangelogSchema.parse(request.body);
	} catch (error) {
		return sendErrorApiResponse(reply, {
			error: error instanceof Error ? error.message : 'Invalid update',
			status_code: '400',
		});
	}

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
	// Merge the editable fields while preserving server-owned metadata

	const merged = { ...previous, ...patch };

	// Record publication metadata only when entering the published state.
	const publication = merged.status === 'published' && previous.status !== 'published'
		? { published_at: Date.now(), published_by: request.me._id }
		: {};

	//
	// Validate the complete release before accepting content or status changes

	const candidate = ChangelogSchema.safeParse({
		...merged,
		...publication,
		updated_at: Math.max(Date.now(), previous.updated_at + 1),
		updated_by: request.me._id,
	});

	if (!candidate.success) {
		return sendErrorApiResponse(reply, {
			error: candidate.error.message,
			status_code: '400',
		});
	}

	//
	// Save only if no other request has updated this document in the meantime

	const updated = await goDb.core.changelogs.replaceOne({ _id: request.params.id, updated_at: previous.updated_at }, candidate.data);

	if (!updated) {
		return sendErrorApiResponse(reply, {
			error: 'Release changed while saving; reload and retry',
			status_code: '409',
		});
	}

	return sendSuccessApiResponse(reply, updated);
}
