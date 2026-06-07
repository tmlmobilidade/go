/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { encodeGtfsRtFeed, getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export class RealtimeController {
	//

	static async getTripUpdatesGtfsRtJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await apiCache.get('hub:realtime:eta:gtfs');
		if (!raw) {
			Logger.error('[hub/v1/realtime:getTripUpdatesGtfsRtJson()] No data in cache.');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=5')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: getEmptyGtfsRtFeedMessage(),
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		}
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(raw),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	static async getTripUpdatesGtfsRtProtobuf(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await apiCache.get('hub:realtime:eta:gtfs');
		if (!raw) {
			Logger.error('[hub/v1/realtime:getTripUpdatesGtfsRtProtobuf()] No data in cache.');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=5')
				.code(HTTP_STATUS.NO_CONTENT)
				.send();
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

	static async getVehiclesMetadataJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await apiCache.get('hub:realtime:vehicles:metadata:json');
		if (!raw) {
			Logger.error('[hub/v1/realtime:getVehiclesMetadataJson()] No data in cache.');
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
			.header('cache-control', 'public, max-age=60')
			.code(HTTP_STATUS.OK)
			.send(JSON.parse(raw));
	}

	static async getVehiclesPositionsGtfsRtJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await apiCache.get('hub:realtime:vehicles:positions:gtfs');
		if (!raw) {
			Logger.error('[hub/v1/realtime:getVehiclesPositionsProtobuf()] No data in cache.');
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

	static async getVehiclesPositionsGtfsRtProtobuf(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const raw = await apiCache.get('hub:realtime:vehicles:positions:gtfs');
		if (!raw) {
			Logger.error('[hub/v1/realtime:getVehiclesPositionsGtfsRtProtobuf()] No data in cache.');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=5')
				.code(HTTP_STATUS.NO_CONTENT)
				.send();
		}
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.type('application/octet-stream')
			.code(HTTP_STATUS.OK)
			.send(Buffer.from(raw));
	}

	static async getVehiclesPositionsJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
		//

		const cachedData = await apiCache.get('hub:realtime:vehicles:positions:json');

		if (!cachedData) {
			Logger.error('[hub/v1/realtime:getVehiclesPositionsJson()] No cached data found for vehicles positions');
			return reply
				.header('access-control-allow-origin', '*')
				.header('cache-control', 'public, max-age=3')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		};

		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=3')
			.code(HTTP_STATUS.OK)
			.send({
				data: JSON.parse(cachedData),
				error: null,
				status_code: HTTP_STATUS.OK,
			});
	}

	//
}
