/* * */

import { sendLocationFeed } from '@/endpoints/v1/locations/lib/send-location-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class LocalitiesController {
	static async getLocalities(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return sendLocationFeed<Record<string, unknown>>(
			reply,
			'hub:locations:localities',
			SERVERDB_KEYS.LOCATIONS.LOCALITIES,
			'hub/v1/locations/localities:getLocalities()',
		);
	}
}
