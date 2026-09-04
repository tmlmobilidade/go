/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';

/**
 * Returns the current time in different formats.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getTime(request: FastifyRequest, reply: FastifyReply<unknown>) {
	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=5')
		.code(200)
		.send(
			JSON.stringify({
				now: Dates.now('Europe/Lisbon').unix_milliseconds,
				now_iso: Dates.now('Europe/Lisbon').iso,
				now_minus_20_seconds: Dates.now('Europe/Lisbon').minus({ seconds: 20 }).unix_milliseconds,
				now_minus_5_minutes: Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_milliseconds,
				now_minus_90_seconds: Dates.now('Europe/Lisbon').minus({ seconds: 90 }).unix_milliseconds,
			}),
		);
}
