/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Attachment } from '@tmlmobilidade/go-types-core';

/**
 * Returns the TTS audio file attachment of a Stop.
 * @param request The request object containing the file ID in the params
 * @param reply The reply object
 */
export async function getTtsHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Attachment>) {
	//

	//
	// Get the file from storage

	const fileData = await storageProvider.findById(request.params.id);

	return sendSuccessApiResponse(reply, fileData);
}
