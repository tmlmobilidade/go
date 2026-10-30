/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Changelog, type CreateChangelogDto, CreateChangelogSchema } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * Create a changelog draft.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function createChangelogHandler(request: FastifyRequest<{ Body: CreateChangelogDto }>, reply: FastifyReply<Changelog>) {
	//

	//
	// Validate the editable content

	const validated = CreateChangelogSchema.safeParse(request.body);

	if (!validated.success) {
		return sendErrorApiResponse(reply, {
			error: validated.error.message,
			status_code: '400',
		});
	}

	const content = validated.data;

	//
	// Create a draft with server-owned audit and publication fields

	const document = await goDb.core.changelogs.insertOne({
		...content,
		created_by: request.me._id,
		is_locked: false,
		publish_status: 'draft',
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, document);
}
