/* * */

import { sendLocationFeed } from '@/endpoints/v1/locations/lib/send-location-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class MunicipalitiesController {
	static async getMunicipalities(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return sendLocationFeed<Record<string, unknown>>(
			reply,
			'hub:locations:municipalities:json',
			SERVERDB_KEYS.LOCATIONS.MUNICIPALITIES,
			'hub/v1/locations/municipalities:getMunicipalities()',
		);
	}
}
