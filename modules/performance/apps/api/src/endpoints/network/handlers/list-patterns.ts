import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { readNetwork } from '@tmlmobilidade/go-performance-pckg-scripts';

/** List patterns represented in completed metric generations. */
export async function listPatternsHandler(request: FastifyRequest, reply: FastifyReply<string[]>) {
	return reply.send({ data: await readNetwork('pattern_id'), error: null, statusCode: HTTP_STATUS.OK });
}
