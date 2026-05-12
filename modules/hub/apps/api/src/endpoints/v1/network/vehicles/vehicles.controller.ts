/* * */

import { readThroughHubJson } from '@/endpoints/v1/lib/hub-json-feed.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export class VehiclesController {
	static async getVehiclesJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await readThroughHubJson(
			'hub:network:vehicles:json',
			SERVERDB_KEYS.NETWORK.VEHICLES.ALL,
			'hub/v1/network/vehicles:getVehiclesJson()',
		);
		if (!raw) {
			Logger.error('[hub/v1/network/vehicles:getVehiclesJson()] No data in cache or SERVERDB.');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=5')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		}

		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.OK)
			.send(JSON.parse(raw));
	}

	static async getVehiclesProtobuf(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await readThroughHubJson(
			'hub:network:vehicles:protobuf:json',
			SERVERDB_KEYS.NETWORK.VEHICLES.PROTOBUF,
			'hub/v1/network/vehicles:getVehiclesProtobuf()',
		);
		if (!raw) {
			Logger.error('[hub/v1/network/vehicles:getVehiclesProtobuf()] No data in cache or SERVERDB.');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=5')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		}

		const allItemsData = JSON.parse(raw) as GtfsRtFeedMessage;
		const buffer = await encodeGtfsRtFeed(allItemsData);
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.type('application/octet-stream')
			.code(HTTP_STATUS.OK)
			.send(Buffer.from(buffer));
	}
}
