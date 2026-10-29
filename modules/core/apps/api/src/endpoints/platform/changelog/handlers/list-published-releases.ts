/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Changelog, type ChangelogsQuery, ChangelogsQuerySchema, type ChangelogSummary, ChangelogSummarySchema } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * List all published releases for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listPublishedReleasesHandler(request: FastifyRequest<{ Querystring: ChangelogsQuery }>, reply: FastifyReply<ChangelogSummary[]>) {
	//

	// Prevent HTTP caches from storing release summaries with this user's seen state.
	reply.header('Cache-Control', 'no-store');

	//
	// Validate the optional module filter

	const query = ChangelogsQuerySchema.safeParse(request.query);

	if (!query.success) {
		return sendErrorApiResponse(reply, {
			error: query.error.message,
			status_code: '400',
		});
	}

	const { module_id: moduleId } = query.data;
	const userId = request.me._id;

	//
	// Match published releases for the requested module, including platform updates

	const filter: Filter<Changelog> = moduleId
		? {
			$or: [{ 'scope.type': 'platform' }, { 'scope.module_ids': moduleId, 'scope.type': 'modules' }],
			status: 'published',
		}
		: { status: 'published' };

	//
	// Load all matching releases and their per-user seen state

	const releases = await goDb.core.changelogs.findMany(filter, { sort: [['published_at', -1], ['_id', -1]] });
	const views = await goDb.core.changelogViews.findMany({ release_id: { $in: releases.map(release => release._id) }, user_id: userId });
	const seenIds = new Set(views.map(view => view.release_id));

	//
	// Return compact summaries; readers derive unread counts from is_seen

	const items = releases.map((release) => {
		const counts = { bug_fix: 0, improvement: 0, new_feature: 0 };

		for (const item of release.items) counts[item.category]++;

		return ChangelogSummarySchema.parse({ ...release, category_counts: counts, is_seen: seenIds.has(release._id) });
	});

	return sendSuccessApiResponse(reply, items);
}
