/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache, type ApiCacheKey } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { StopFacility } from '@tmlmobilidade/types';

/* * */

export class FacilitiesController {
	static async getBoatStations(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:boat_stations:json', 'getBoatStations()');
	}

	static async getFacilities(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:json', 'getFacilities()');
	}

	static async getHelpdesks(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:helpdesks:json', 'getHelpdesks()');
	}

	static async getLightRailStations(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:light_rail_stations:json', 'getLightRailStations()');
	}

	static async getPips(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:pips:json', 'getPips()');
	}

	static async getSchools(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:schools:json', 'getSchools()');
	}

	static async getStores(request: FastifyRequest, reply: FastifyReply<unknown>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:stores:json', 'getStores()', 30);
	}

	static async getSubwayStations(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:subway_stations:json', 'getSubwayStations()');
	}

	static async getTrainStations(request: FastifyRequest, reply: FastifyReply<StopFacility[]>) {
		return FacilitiesController.sendCachedFacilityJson(reply, 'hub:facilities:train_stations:json', 'getTrainStations()');
	}

	private static async sendCachedFacilityJson(reply: FastifyReply<StopFacility[] | unknown>, cacheKey: ApiCacheKey, methodName: string, successMaxAgeSeconds = 3600) {
		//

		const cachedData = await apiCache.get(cacheKey);
		if (!cachedData) {
			Logger.error(`[hub/v1/facilities:${methodName}] No JSON feed found in cache. Returning empty array.`);
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
			.header('cache-control', `public, max-age=${successMaxAgeSeconds}`)
			.code(HTTP_STATUS.OK)
			.send(JSON.parse(cachedData));
	}
}
