/* * */

import { readThroughHubJson } from '@/endpoints/v1/lib/hub-json-feed.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export class FeedsController {
	static async getDates(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FeedsController.sendNetworkJson(reply, 'hub:network:dates:json', SERVERDB_KEYS.NETWORK.DATES, 'hub/v1/network/feeds:getDates()');
	}

	static async getGtfsStaticZip(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const storageServiceResponse = await fetch('https://storage.carrismetropolitana.pt/static/gtfs-multi-operador.zip');
		if (!storageServiceResponse.ok || !storageServiceResponse.body) {
			return reply.code(500).send('Could not fetch file.');
		}
		reply.header('Content-Disposition', 'attachment; filename="CMET.zip"');
		reply.header('Content-Type', 'application/zip');
		const contentLength = storageServiceResponse.headers.get('Content-Length');
		if (contentLength) reply.header('Content-Length', contentLength);
		return reply.send(storageServiceResponse.body);
	}

	static async getLines(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FeedsController.sendNetworkJson(reply, 'hub:network:lines:json', SERVERDB_KEYS.NETWORK.LINES, 'hub/v1/network/feeds:getLines()');
	}

	static async getPeriods(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FeedsController.sendNetworkJson(reply, 'hub:network:periods:json', SERVERDB_KEYS.NETWORK.PERIODS, 'hub/v1/network/feeds:getPeriods()');
	}

	static async getRoutes(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FeedsController.sendNetworkJson(reply, 'hub:network:routes:json', SERVERDB_KEYS.NETWORK.ROUTES, 'hub/v1/network/feeds:getRoutes()');
	}

	static async getStops(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FeedsController.sendNetworkJson(reply, 'hub:network:stops:json', SERVERDB_KEYS.NETWORK.STOPS, 'hub/v1/network/feeds:getStops()');
	}

	private static async sendNetworkJson(
		reply: FastifyReply<unknown>,
		cacheKey: 'hub:network:dates:json' | 'hub:network:lines:json' | 'hub:network:periods:json' | 'hub:network:routes:json' | 'hub:network:stops:json',
		serverKey: string,
		logCtx: string,
	) {
		const raw = await readThroughHubJson(cacheKey, serverKey, logCtx);
		if (!raw) {
			Logger.error(`[${logCtx}] No data in cache or SERVERDB.`);
			return reply
				.header('cache-control', 'public, max-age=20')
				.code(HTTP_STATUS.NO_CONTENT)
				.send({
					data: [],
					error: null,
					status_code: HTTP_STATUS.NO_CONTENT,
				});
		}

		return reply
			.header('cache-control', 'public, max-age=3600')
			.code(HTTP_STATUS.OK)
			.send(JSON.parse(raw));
	}
}
