/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type ChangelogManagementQuery, ChangelogManagementQuerySchema, type ChangelogReleaseListItem, ChangelogReleaseListItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/* * */

/**
 * List changelog releases.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listChangelogReleasesHandler(request: FastifyRequest<{ Querystring: ChangelogManagementQuery }>, reply: FastifyReply<ChangelogReleaseListItem[]>) {
	//

	//
	// Validate the optional publication status filter

	const query = ChangelogManagementQuerySchema.safeParse(request.query);

	if (!query.success) {
		return sendErrorApiResponse(reply, {
			error: query.error.message,
			status_code: '400',
		});
	}

	//
	// Retrieve documents in management order

	const { status } = query.data;
	const documents = await goDb.core.changelogs.findMany(status ? { status } : {}, { sort: [['updated_at', -1], ['_id', -1]] });

	//
	// Return only the fields needed by the management list

	const items = ChangelogReleaseListItemSchema.array().parse(documents);

	return sendSuccessApiResponse(reply, items);
}
