import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { readNetwork } from '@tmlmobilidade/go-performance-pckg-scripts';

/** List patterns represented in completed metric generations. */
export async function listPatternsHandler(request: FastifyRequest, reply: FastifyReply<string[]>) {
	return sendSuccessApiResponse(reply, await readNetwork('pattern_id'));
}
