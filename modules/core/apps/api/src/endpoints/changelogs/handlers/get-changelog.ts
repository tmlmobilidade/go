/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Changelog } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * Get a changelog document for management.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getChangelogHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Changelog>) {
	//

	//
	// Find the requested document

	const document = await goDb.core.changelogs.findById(request.params.id);

	if (!document) {
		return sendErrorApiResponse(reply, {
			error: 'Changelog release not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, document);
}
