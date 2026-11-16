import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { readNetwork } from '@tmlmobilidade/go-performance-pckg-scripts';

/** List lines represented in completed metric generations. */
export async function listLinesHandler(request: FastifyRequest, reply: FastifyReply<string[]>) {
	return sendSuccessApiResponse(reply, await readNetwork('line_id'));
}
