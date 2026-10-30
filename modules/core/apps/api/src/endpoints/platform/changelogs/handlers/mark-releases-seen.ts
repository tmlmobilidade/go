/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ChangelogSeenPlatformRequest, ChangelogSeenPlatformRequestSchema, type ChangelogSeenPlatformResponse } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/**
 * Mark releases seen for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function markReleasesSeenHandler(request: FastifyRequest<{ Body: ChangelogSeenPlatformRequest }>, reply: FastifyReply<ChangelogSeenPlatformResponse>) {
	//

	//
	// Validate the explicitly displayed releases

	const validated = ChangelogSeenPlatformRequestSchema.safeParse(request.body);

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
	const releases = await goDb.core.changelogs.findMany({ _id: { $in: releaseIds }, publish_status: 'published' });

	if (releases.length !== releaseIds.length) {
		return sendErrorApiResponse(reply, {
			error: 'One or more published releases were not found',
			status_code: '404',
		});
	}

	//
	// Merge acknowledgements into the current user's state

	const user = await goDb.core.users.findById(userId);

	if (!user) {
		return sendErrorApiResponse(reply, { error: 'User not found', status_code: '404' });
	}

	const seenAt = Dates.now('utc').unix_milliseconds;
	const seen = user.seen_changelogs ?? [];
	const seenIds = new Set(seen.map(entry => entry.changelog_id));
	const newEntries = releaseIds.filter(releaseId => !seenIds.has(releaseId)).map(releaseId => ({
		changelog_id: releaseId,
		seen_at: seenAt,
	}));

	if (newEntries.length) {
		await goDb.core.users.updateOne({ _id: userId }, { seen_changelogs: [...seen, ...newEntries] });
	}

	return sendSuccessApiResponse(reply, { success: true });
}
