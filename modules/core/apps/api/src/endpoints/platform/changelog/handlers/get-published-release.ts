/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ChangelogPlatformResponse, ChangelogPlatformResponseSchema } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * Get published release for the authenticated user.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getPublishedReleaseHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<ChangelogPlatformResponse>) {
	//

	// Prevent HTTP caches from storing release details with this user's seen state.
	reply.header('Cache-Control', 'no-store');

	//
	// Find the published release and its seen state

	const release = await goDb.core.changelogs.findOne({ _id: request.params.id, publish_status: 'published' });

	if (!release) {
		return sendErrorApiResponse(reply, {
			error: 'Published release not found',
			status_code: '404',
		});
	}

	//
	// Attach this user’s seen state without acknowledging the release

	const view = await goDb.core.changelogViews.findOne({ release_id: request.params.id, user_id: request.me._id });

	const result = ChangelogPlatformResponseSchema.parse({ ...release, is_seen: view !== null });

	return sendSuccessApiResponse(reply, result);
}
