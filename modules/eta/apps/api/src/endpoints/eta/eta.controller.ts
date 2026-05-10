/* * */

import { pipelinePath } from '@/lib/sql-paths.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { GOClickHouseClient, queryFromFile } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

interface Eta {
	current_node_index: number
	eta_at: null | string
	eta_seconds: null | number
	hashed_shape_id: string
	hashed_trip_id: string
	position_created_at: number
	refreshed_at: string
	stop_id: string
	stop_name: string
	stop_node_index: number
	stop_sequence: number
	trip_id: string
	vehicle_id: string
}

/* * */

export class EtaController {
	//
	private static readonly getAllQuery = pipelinePath('api/1-select-pred-trip-stop-etas.sql');
	private static readonly getByTripIdQuery = pipelinePath('api/2-select-pred-trip-stop-etas-by-trip-id.sql');

	/**
	 * Returns all rows from eta.pred_trip_stop_etas.
	 * @param _request Fastify request.
	 * @param reply Fastify reply.
	 */
	static async getAll(_request: FastifyRequest, reply: FastifyReply<Eta[]>) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const allEtas = await queryFromFile<Eta>(clickhouseClient, EtaController.getAllQuery);
		reply.send({ data: allEtas, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns eta.pred_trip_stop_etas rows by trip_id.
	 * @param request Fastify request with trip_id path parameter.
	 * @param reply Fastify reply.
	 */
	static async getByTripId(request: FastifyRequest<{ Params: { tripId: string } }>, reply: FastifyReply<Eta[]>) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const tripEtas = await queryFromFile<Eta>(clickhouseClient, EtaController.getByTripIdQuery, {
			trip_id: request.params.tripId,
		});
		reply.send({ data: tripEtas, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
