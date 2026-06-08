/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class DebugController {
	//

	static async getAppEnabled(request: FastifyRequest, reply: FastifyReply<unknown>) {
		//

		const appEnabled = await apiCache.get('hub:navegante:app-enabled');

		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(200)
			.send({ app_enabled: appEnabled });
	}

	static async getTime(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(200)
			.send(
				JSON.stringify({
					now: Dates.now('Europe/Lisbon').unix_timestamp,
					now_iso: Dates.now('Europe/Lisbon').iso,
					now_minus_20_seconds: Dates.now('Europe/Lisbon').minus({ seconds: 20 }).unix_timestamp,
					now_minus_5_minutes: Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp,
					now_minus_90_seconds: Dates.now('Europe/Lisbon').minus({ seconds: 90 }).unix_timestamp,
				}),
			);
	}

	//
}
