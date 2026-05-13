/* * */

import { readThroughHubJson } from '@/endpoints/v1/lib/hub-json-feed.js';
import { SERVERDB_KEYS } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type NetworkPattern } from '@tmlmobilidade/go-hub-pckg-types';
import { DateTime } from 'luxon';

/* * */

interface RequestSchema {
	Params: {
		id: string
	}
}

/* * */

const regexPatternForStopId = /^\d{6}$/;

/* * */

export class ArrivalsController {
	static async getArrivalsByPattern(request: FastifyRequest<RequestSchema>, reply: FastifyReply<unknown>) {
		const todayDateString = DateTime.now().toFormat('yyyyMMdd');
		const id = request.params.id;
		const cacheKey = 'hub:network:patterns:{patternId}:json';

		const foundPatternTxt = await readThroughHubJson(cacheKey, SERVERDB_KEYS.NETWORK.PATTERNS.ID(id), `hub/v1/network/arrivals:getArrivalsByPattern(${id})`, { patternId: id }) as string;
		if (!foundPatternTxt) {
			return reply.status(404).send([]);
		}
		const foundPatternData: NetworkPattern[] = JSON.parse(foundPatternTxt);
		const activePatternsData = foundPatternData?.filter(pattern => pattern.valid_on.includes(todayDateString));

		if (!activePatternsData?.length) {
			return reply.status(404).send([]);
		}

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=20')
			.send([]);
	}

	static async getArrivalsByStop(request: FastifyRequest<RequestSchema>, reply: FastifyReply<unknown>) {
		if (!regexPatternForStopId.test(request.params.id)) {
			return reply.status(400).send([]);
		}

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=20')
			.send([]);
	}
}
