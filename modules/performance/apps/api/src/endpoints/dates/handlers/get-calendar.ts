import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { readCalendar } from '@tmlmobilidade/go-performance-pckg-scripts';

/** Return the last successfully imported calendar. */
export async function getCalendarHandler(request: FastifyRequest, reply: FastifyReply<Record<string, unknown>[]>) {
	return reply.send({ data: await readCalendar(), error: null, statusCode: HTTP_STATUS.OK });
}
