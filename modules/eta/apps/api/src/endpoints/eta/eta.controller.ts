/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { GOClickHouseClient, queryFromString } from '@tmlmobilidade/databases';
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

	/**
	 * Returns all rows from eta.live_trip_stop_etas.
	 * @param _request Fastify request.
	 * @param reply Fastify reply.
	 */
	static async getAll(_request: FastifyRequest, reply: FastifyReply<Eta[]>) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const allEtas = await queryFromString<Eta>(
			clickhouseClient,
			`
				SELECT
					trip_id,
					vehicle_id,
					hashed_trip_id,
					hashed_shape_id,
					current_node_index,
					position_created_at,
					stop_sequence,
					stop_id,
					stop_name,
					stop_node_index,
					eta_seconds,
					eta_at,
					refreshed_at,
					arrival_time,
					planned_arrival_at,
					delay_seconds
				FROM eta.live_trip_stop_etas
				ORDER BY trip_id, vehicle_id, stop_sequence
			`,
		);
		reply.send({ data: allEtas, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns eta.live_trip_stop_etas rows by trip_id.
	 * @param request Fastify request with trip_id path parameter.
	 * @param reply Fastify reply.
	 */
	static async getByTripId(request: FastifyRequest<{ Params: { trip_id: string } }>, reply: FastifyReply<Eta[]>) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const tripEtas = await queryFromString<Eta>(
			clickhouseClient,
			`
				SELECT
					trip_id,
					vehicle_id,
					hashed_trip_id,
					hashed_shape_id,
					current_node_index,
					position_created_at,
					stop_sequence,
					stop_id,
					stop_name,
					stop_node_index,
					eta_seconds,
					eta_at,
					refreshed_at,
					arrival_time,
					planned_arrival_at,
					delay_seconds
				FROM eta.live_trip_stop_etas
				WHERE trip_id = $1
				ORDER BY stop_sequence
			`,
			{ 1: request.params.trip_id },
		);
		reply.send({ data: tripEtas, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
