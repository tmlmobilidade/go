/* * */

import { getTripUpdatesGtfsRtJson } from '@/endpoints/v1/realtime/get-trip-updates-gtfs-rt-json.js';
import { getTripUpdatesGtfsRtProtobuf } from '@/endpoints/v1/realtime/get-trip-updates-gtfs-rt-protobuf.js';
import { getVehicleMetadataJson } from '@/endpoints/v1/realtime/get-vehicle-metadata-json.js';
import { getVehiclePositionsGtfsRtJson } from '@/endpoints/v1/realtime/get-vehicle-positions-gtfs-rt-json.js';
import { getVehiclePositionsGtfsRtProtobuf } from '@/endpoints/v1/realtime/get-vehicle-positions-gtfs-rt-protobuf.js';
import { getVehiclePositionsJson } from '@/endpoints/v1/realtime/get-vehicle-positions-json.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/realtime';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/vehicles/metadata', getVehicleMetadataJson);
		instance.get('/vehicles/positions', getVehiclePositionsJson);
		instance.get('/vehicles/positions/gtfs', getVehiclePositionsGtfsRtJson);
		instance.get('/vehicles/positions/gtfs.pb', getVehiclePositionsGtfsRtProtobuf);

		instance.get('/trip-updates', getTripUpdatesGtfsRtJson);
		instance.get('/trip-updates.pb', getTripUpdatesGtfsRtProtobuf);

		next();
	},
	{ prefix: namespace },
);
