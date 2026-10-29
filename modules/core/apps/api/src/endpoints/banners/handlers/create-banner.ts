/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Banner, type CreateBannerDto, CreateBannerSchema } from '@tmlmobilidade/go-types-core';

/* * */

/**
 * Create an banner draft.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function createBannerHandler(request: FastifyRequest<{ Body: CreateBannerDto }>, reply: FastifyReply<Banner>) {
	//

	//
	// Validate the editable content

	let content: CreateBannerDto;

	try {
		content = CreateBannerSchema.parse(request.body);
	} catch (error) {
		return sendErrorApiResponse(reply, {
			error: error instanceof Error ? error.message : 'Invalid banner data',
			status_code: '400',
		});
	}

	//
	// Create a draft with server-owned audit and publication fields

	const document = await goDb.core.banners.insertOne({
		...content,
		created_by: request.me._id,
		dismissal_version: 1,
		is_locked: false,
		published_at: null,
		published_by: null,
		status: 'draft',
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, document);
}
