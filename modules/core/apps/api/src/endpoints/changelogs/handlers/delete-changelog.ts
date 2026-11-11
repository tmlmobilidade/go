/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/* * */

/**
 * Delete a changelog from the database.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function deleteChangelogHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Find the document and reject deletion of locked content

	const document = await goDb.core.changelogs.findById(request.params.id);

	if (!document) {
		return sendErrorApiResponse(reply, { error: 'Changelog not found', status_code: '404' });
	}

	if (document.is_locked) {
		return sendErrorApiResponse(reply, { error: 'Changelog is locked', status_code: '409' });
	}

	//
	// Delete only while the document is still unlocked

	const result = await goDb.core.changelogs.deleteOne({ _id: request.params.id, is_locked: { $ne: true } });

	if (!result.deletedCount) {
		return sendErrorApiResponse(reply, { error: 'Changelog changed while deleting; reload and retry', status_code: '409' });
	}

	return sendSuccessApiResponse(reply, undefined);
}
