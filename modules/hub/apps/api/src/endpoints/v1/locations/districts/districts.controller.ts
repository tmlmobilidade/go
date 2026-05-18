/* * */

import { sendLocationFeed } from '@/endpoints/v1/locations/lib/send-location-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class DistrictsController {
	static async getDistricts(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return sendLocationFeed<Record<string, unknown>>(
			reply,
			'hub:locations:districts',
			SERVERDB_KEYS.LOCATIONS.DISTRICTS,
			'hub/v1/locations/districts:getDistricts()',
		);
	}
}
