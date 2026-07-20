/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { files } from '@tmlmobilidade/interfaces';

/**
 * Retrieves the DRT model file
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getDrtModel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const file = await files.findById(`drt-model-${request.params.id}`);
	if (!file) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'DRT model file not found');
	// Redirect to the file download url
	return reply.redirect(file.url);
}
