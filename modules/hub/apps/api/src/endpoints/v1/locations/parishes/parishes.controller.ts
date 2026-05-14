/* * */

import { sendLocationFeed } from '@/endpoints/v1/locations/lib/send-location-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class ParishesController {
	static async getParishes(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return sendLocationFeed<Record<string, unknown>>(
			reply,
			'hub:locations:parishes',
			SERVERDB_KEYS.LOCATIONS.PARISHES,
			'hub/v1/locations/parishes:getParishes()',
		);
	}
}
