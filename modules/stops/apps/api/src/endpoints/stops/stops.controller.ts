/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { patterns, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type CreateStopDto, CreateStopSchema, type Stop, type StopId, type UpdateStopDto } from '@tmlmobilidade/types';

/**
 * This is an example controller that is using the stops interface.
 */

export class StopsController {
	//

	/**
	 * Creates a new Stop
	 * @param request Fastify request containing stop data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateStopDto }>, reply: FastifyReply<Stop>) {
		const data = CreateStopSchema.parse(request.body);
		const newStopId = await generateStopId();
		const result = await stops.insertOne({ ...data, _id: newStopId }, { unsafe: true });

		Logger.info([], {
			action: 'create',
			email: request.me.email,
			feature: 'stops',
			message: `Stop created - ${newStopId}`,
			request,
			value: { stopId: newStopId },
		});

		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Toggles the deleted status of a stop by ID.
	 * @param request Fastify request containing stop ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		await stops.toggleDeleteById(request.params.id);
		const foundStop = await stops.findById(request.params.id);
		if (!foundStop) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, `Can not find stop with ID ${request.params.id}`);
			Logger.error(error, {
				action: 'delete',
				email: request.me.email,
				feature: 'stops',
				message: error.message,
				request,
				value: { stopId: request.params.id },
			});
			throw error;
		}
		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all stops, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
		const data = await stops.findMany({}, {
			projection: { _id: 1, flags: 1, is_deleted: 1, latitude: 1, legacy_ids: 1, lifecycle_status: 1, longitude: 1, municipality_id: 1, name: 1 },
			sort: { created_at: -1 },
		});
		if (!data) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Can not get stops from database');
			Logger.error(error, {
				action: 'getAll',
				email: request.me.email,
				feature: 'stops',
				message: error.message,
				request,
			});
			throw error;
		}
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Generates and retrieves a new unique Stop ID
	 * that does not conflict with existing IDs or deleted CM Stops.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getValidId(request: FastifyRequest, reply: FastifyReply<StopId>) {
		const newStopId = await generateStopId();
		if (!newStopId) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Can not generate a new stop ID');
			Logger.error(error, {
				action: 'getValidId',
				email: request.me.email,
				feature: 'stops',
				message: error.message,
				request,
			});
			throw error;
		}

		reply.send({ data: newStopId, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		const foundStop = await stops.findById(Number(request.params.id));
		if (!foundStop) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, `Can not find stop with ID ${request.params.id}`);
			Logger.error(error, {
				action: 'getById',
				email: request.me.email,
				feature: 'stops',
				message: error.message,
				request,
				value: { stopId: request.params.id },
			});
			throw error;
		}

		//
		// Get pattern ids that reference this event in manual pattern rules

		const associatedPatterns = await patterns.findMany(
			{
				'path.stop_id': Number(request.params.id),
			},
			{
				projection: {
					_id: 1,
					code: 1,
					headsign: 1,
					line_id: 1,
					route_id: 1,
				},
				sort: { code: 1 },
			},
		);

		if (!associatedPatterns) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Can not get associated patterns for stop with ID ${request.params.id}`);
			Logger.error(error, {
				action: 'getById',
				email: request.me.email,
				feature: 'stops',
				message: error.message,
				request,
				value: { stopId: request.params.id },
			});
			throw error;
		}

		reply.send({
			data: { ...foundStop, associated_patterns: associatedPatterns },
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Toggles the lock status of a stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		await stops.toggleLockById(request.params.id);
		const foundStop = await stops.findById(request.params.id);
		if (!foundStop) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');
			Logger.error(error, {
				action: 'lock',
				email: request.me.email,
				feature: 'stops',
				message: `Can not find stop with ID ${request.params.id}`,
				request,
				value: { stopId: request.params.id },
			});
			throw error;
		}
		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing stop by ID
	 * @param request Fastify request containing stop ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateStopDto, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		// Check if the stop exists before attempting to update
		const foundStop = await stops.findById(Number(request.params.id));
		if (!foundStop) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, `Can not find stop with ID ${request.params.id}`);
			Logger.error(error, {
				action: 'update',
				email: request.me.email,
				feature: 'stops',
				message: error.message,
				request,
				value: { stopId: request.params.id },
			});
			throw error;
		}
		// Ensure the flag IDs are saved in the legacy IDs array
		const flagIds = request.body.flags?.map(flag => flag.stop_id) || [];
		const existingLegacyIds = new Set(foundStop.legacy_ids || []);
		flagIds.forEach(flagId => existingLegacyIds.add(flagId));
		request.body.legacy_ids = Array.from(existingLegacyIds);
		// Perform the update
		const data = await stops.updateById(Number(request.params.id), request.body);
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });

		Logger.info([], {
			action: 'update',
			email: request.me.email,
			feature: 'stops',
			message: `Stop updated - ${request.params.id}`,
			request,
			value: { stopId: request.params.id },
		});
	}
}
