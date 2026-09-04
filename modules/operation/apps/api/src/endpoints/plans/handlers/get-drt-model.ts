/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';

/**
 * Retrieves the DRT model file
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getDrtModelHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const file = await storageProvider.findById(`drt-model-${request.params.id}`);
	// Redirect to the file download url
	return reply.redirect(file.url);
}
