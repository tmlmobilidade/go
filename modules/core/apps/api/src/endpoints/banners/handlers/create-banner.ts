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

	const result = CreateBannerSchema.safeParse(request.body);
	if (!result.success) return sendErrorApiResponse(reply, { error: result.error, status_code: '400' });
	const content = result.data;

	//
	// Create a draft with server-owned audit and publication fields

	const document = await goDb.core.banners.insertOne({
		...content,
		created_by: request.me._id,
		dismissal_version: 1,
		is_locked: false,
		publish_status: 'draft',
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, document);
}
