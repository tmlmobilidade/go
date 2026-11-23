import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { readCalendar } from '@tmlmobilidade/go-performance-pckg-scripts';

/** Return the last successfully imported calendar. */
export async function getCalendarHandler(request: FastifyRequest, reply: FastifyReply<Record<string, unknown>[]>) {
	return sendSuccessApiResponse(reply, await readCalendar());
}
