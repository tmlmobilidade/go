/* * */

import { pipelinePath } from '@/lib/sql-paths.js';
import { queryEtaFromFile } from '@/lib/eta-query.js';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

interface Eta {
	estimated_arrival: null | string
	estimated_arrival_unix: null | number
	headsign: null | string
	line_id: string
	observed_arrival: null | string
	observed_arrival_unix: null | number
	pattern_id: string
	route_id: string
	scheduled_arrival: null | string
	scheduled_arrival_unix: null | number
	stop_id: string
	stop_sequence: number
	trip_id: string
	vehicle_id: string
}

/* * */

export class EtaController {
	//
	private static readonly getAllQuery = pipelinePath('api/1-select-pred-trip-stop-etas.sql');
	private static readonly getByPatternIdQuery = pipelinePath('api/4-select-pred-trip-stop-etas-by-pattern-id.sql');
	private static readonly getByStopIdQuery = pipelinePath('api/3-select-pred-trip-stop-etas-by-stop-id.sql');
	private static readonly getByTripIdQuery = pipelinePath('api/2-select-pred-trip-stop-etas-by-trip-id.sql');

	/**
	 * Returns all rows from eta.pred_trip_stop_etas.
	 * @param _request Fastify request.
	 * @param reply Fastify reply.
	 */
	static async getAll(_request: FastifyRequest, reply: any) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const allEtas = await queryEtaFromFile<Eta>(clickhouseClient, EtaController.getAllQuery);
		reply.send(allEtas);
	}

	/**
	 * Returns eta.pred_trip_stop_etas rows by trip_id.
	 * @param request Fastify request with trip_id path parameter.
	 * @param reply Fastify reply.
	 */
	static async getByTripId(request: FastifyRequest<{ Params: { tripId: string } }>, reply: any) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const tripEtas = await queryEtaFromFile<Eta>(clickhouseClient, EtaController.getByTripIdQuery, {
			trip_id: request.params.tripId,
		});
		reply.send(tripEtas).header('cache-control', 'public, max-age=20');
	}

	/**
	 * Returns eta.pred_trip_stop_etas rows by pattern_id.
	 * @param request Fastify request with pattern_id path parameter.
	 * @param reply Fastify reply.
	 */
	static async getByPatternId(request: FastifyRequest<{ Params: { patternId: string } }>, reply: any) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const patternEtas = await queryEtaFromFile<Eta>(clickhouseClient, EtaController.getByPatternIdQuery, {
			pattern_id: request.params.patternId,
		});
		reply.send(patternEtas).header('cache-control', 'public, max-age=20');
	}

	/**
	 * Returns eta.pred_trip_stop_etas rows by stop_id.
	 * @param request Fastify request with stop_id path parameter.
	 * @param reply Fastify reply.
	 */
	static async getByStopId(request: FastifyRequest<{ Params: { stopId: string } }>, reply: any) {
		const clickhouseClient = await GOClickHouseClient.getClient();
		const stopEtas = await queryEtaFromFile<Eta>(clickhouseClient, EtaController.getByStopIdQuery, {
			stop_id: request.params.stopId,
		});
		reply.send(stopEtas).header('cache-control', 'public, max-age=20');
	}

	//
}
