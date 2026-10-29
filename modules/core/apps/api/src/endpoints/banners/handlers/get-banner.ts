/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Banner } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * Get an banner document for management.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getBannerHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Banner>) {
	//

	//
	// Find the requested document

	const document = await goDb.core.banners.findById(request.params.id);

	if (!document) {
		return sendErrorApiResponse(reply, {
			error: 'Banner not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, document);
}
