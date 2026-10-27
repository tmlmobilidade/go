/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type MarkChangelogSeenDto, type MarkChangelogSeenResult, MarkChangelogSeenSchema } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/**
 * Mark releases seen for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function markReleasesSeenHandler(request: FastifyRequest<{ Body: MarkChangelogSeenDto }>, reply: FastifyReply<MarkChangelogSeenResult>) {
	//

	//
	// Validate the explicitly displayed releases

	const validated = MarkChangelogSeenSchema.safeParse(request.body);

	if (!validated.success) {
		return sendErrorApiResponse(reply, {
			error: validated.error.message,
			status_code: '400',
		});
	}

	//
	// Accept acknowledgements only for published releases

	const { release_ids: releaseIds } = validated.data;
	const userId = request.me._id;
	const releases = await goDb.core.changelogs.findMany({ _id: { $in: releaseIds }, status: 'published' });

	if (releases.length !== releaseIds.length) {
		return sendErrorApiResponse(reply, {
			error: 'One or more published releases were not found',
			status_code: '404',
		});
	}

	//
	// Preserve the first acknowledgement for each release

	const seenAt = Dates.now('utc').unix_milliseconds;

	await Promise.all(releaseIds.map(releaseId => goDb.core.changelogViews.insertOneIfAbsent({
		_id: JSON.stringify([userId, releaseId]),
		release_id: releaseId,
		seen_at: seenAt,
		user_id: userId,
	})));

	return sendSuccessApiResponse(reply, { success: true });
}
