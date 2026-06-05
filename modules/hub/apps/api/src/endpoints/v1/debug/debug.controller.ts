/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { DateTime } from 'luxon';

/* * */

export class DebugController {
	//

	static async getTime(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return reply
			.code(200)
			.header('cache-control', 'public, max-age=5')
			.send(
				JSON.stringify({
					now_minus_20_seconds: DateTime.now().minus({ seconds: 20 }).toUnixInteger(),
					now_minus_5_minutes: DateTime.now().setZone('Europe/Lisbon').minus({ minutes: 5 }).toFormat('yyyyLLddHHmm'),
					now_minus_90_seconds: DateTime.now().minus({ seconds: 90 }).toUnixInteger(),
					now_unix_int: DateTime.now().toUnixInteger(),
				}),
			);
	}

	//
}
