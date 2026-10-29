/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Banner, BannerSchema, type UpdateBannerDto, UpdateBannerSchema } from '@tmlmobilidade/go-types-core';
import { isDeepStrictEqual } from 'node:util';

/* * */

/**
 * Update banner content and publication status.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function updateBannerHandler(request: FastifyRequest<{ Body: UpdateBannerDto, Params: { id: string } }>, reply: FastifyReply<Banner>) {
	//

	//
	// Validate the requested content and optional publication status

	let patch: UpdateBannerDto;

	try {
		patch = UpdateBannerSchema.parse(request.body);
	} catch (error) {
		return sendErrorApiResponse(reply, {
			error: error instanceof Error ? error.message : 'Invalid update',
			status_code: '400',
		});
	}

	//
	// Find the current document and reject changes to locked content

	const previous = await goDb.core.banners.findById(request.params.id);

	if (!previous) {
		return sendErrorApiResponse(reply, {
			error: 'Banner not found',
			status_code: '404',
		});
	}

	if (previous.is_locked) {
		return sendErrorApiResponse(reply, {
			error: 'Banner is locked',
			status_code: '409',
		});
	}

	//
	// Merge the editable fields while preserving server-owned metadata

	const merged = { ...previous, ...patch };

	// Content changes invalidate old dismissals; publication changes alone do not.
	const materialFields = ['title', 'message', 'kind', 'severity', 'scope', 'link', 'starts_at', 'ends_at', 'dismissible'] as const;
	const materiallyChanged = materialFields.some(field => !isDeepStrictEqual(previous[field], merged[field]));

	// Record publication metadata only when entering the published state.
	const publication = merged.status === 'published' && previous.status !== 'published'
		? { published_at: Date.now(), published_by: request.me._id }
		: {};

	//
	// Validate the complete document, including partial schedule edits

	const candidate = BannerSchema.safeParse({
		...merged,
		...publication,
		dismissal_version: previous.dismissal_version + Number(materiallyChanged),
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

	const updated = await goDb.core.banners.replaceOne({ _id: request.params.id, updated_at: previous.updated_at }, candidate.data);

	if (!updated) {
		return sendErrorApiResponse(reply, {
			error: 'Banner changed while saving; reload and retry',
			status_code: '409',
		});
	}

	return sendSuccessApiResponse(reply, updated);
}
