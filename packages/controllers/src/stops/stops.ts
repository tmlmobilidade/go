import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { stops } from '@tmlmobilidade/interfaces';
import { type Stop } from '@tmlmobilidade/types';
import { z } from 'zod';

const GetStopsBatchQuerySchema = z.object({
	stop_ids: z.union([z.string(), z.array(z.string())]).optional(),
	stop_names: z.union([z.string(), z.array(z.string())]).optional(),
});

interface StopBatchItem {
	_id: string
	legacy_id?: string
	name: string
}

export class StopsSharedController {
	//

	/**
	 * Gets all stops.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */

	static async getAll(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
		//
		// Resolve hashed trip ids from query directly or by rides filters (date/agency).

		const allStops = await stops.findMany({}, { sort: { created_at: -1 } }) as Stop[];

		//
		// Send the response

		reply.send({ data: allStops, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	static async getBatch(request: FastifyRequest, reply: FastifyReply<{ label: string, legacy_id: string, value: string }[]>) {
		const parsedQuery = GetStopsBatchQuerySchema.parse(request.query);
		const stopIds = parsedQuery.stop_ids
			? (Array.isArray(parsedQuery.stop_ids) ? parsedQuery.stop_ids : [parsedQuery.stop_ids])
			: [];
		const stopNames = parsedQuery.stop_names
			? (Array.isArray(parsedQuery.stop_names) ? parsedQuery.stop_names : [parsedQuery.stop_names])
			: [];

		const matchConditions: Record<string, unknown>[] = [];
		if (stopIds.length > 0) matchConditions.push({ _id: { $in: stopIds } });
		if (stopNames.length > 0) matchConditions.push({ name: { $in: stopNames } });

		const stopsData = await stops.aggregate([
			...(matchConditions.length > 0 ? [{ $match: { $or: matchConditions } }] : []),
			{ $project: { _id: 1, code: 1, name: 1 } },
			{ $sort: { name: 1 } },
		]) as StopBatchItem[];

		reply.send({ data: stopsData.map(stop => ({ label: `${stop.legacy_id} | ${stop.name}`, legacy_id: stop.legacy_id, value: stop._id })), error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Gets a stop by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */

	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Stop>) {
		const stop = await stops.findById(request.params.id);

		if (!stop) {
			return reply.send({ data: null, error: 'Stop not found', statusCode: HTTP_STATUS.NOT_FOUND });
		}

		reply.send({ data: stop, error: null, statusCode: HTTP_STATUS.OK });
	}
}
