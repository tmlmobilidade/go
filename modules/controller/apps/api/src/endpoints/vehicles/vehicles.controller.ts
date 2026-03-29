/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

export class VehiclesController {
	/**
	 * Retrieves the latest position per vehicle from recent simplified vehicle events.
	 */
	static async getPositions(request: FastifyRequest, reply: FastifyReply<unknown>) {
		const positions = await simplifiedVehicleEventsNew.queryFromString(
			`SELECT 
				vehicle_id,
				agency_id,
				trip_id,
				created_at,
				latitude,
				longitude
			FROM operation.simplified_vehicle_events
			WHERE created_at > toUnixTimestamp64Milli(now64(3) - INTERVAL 90 SECOND)
				AND vehicle_id NOT IN ('', NULL)
				AND agency_id NOT IN ('', NULL)
				AND trip_id NOT IN ('', NULL)
				AND floor(latitude) != 0 AND floor(longitude) != 0
			ORDER BY agency_id, vehicle_id, trip_id, created_at DESC
			LIMIT 1 BY vehicle_id`,
		);

		return reply.send({ data: positions, error: null, statusCode: HTTP_STATUS.OK });
	}
}
