/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getVehicleMetadataJsonHandler } from './handlers/get-vehicle-metadata-json.js';
import { getVehiclePositionsGtfsRtJsonHandler } from './handlers/get-vehicle-positions-gtfs-rt-json.js';
import { getVehiclePositionsGtfsRtProtobufHandler } from './handlers/get-vehicle-positions-gtfs-rt-protobuf.js';
import { getVehiclePositionsJsonHandler } from './handlers/get-vehicle-positions-json.js';

/* * */

const NAMESPACE = '/v1/vehicles';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/metadata', getVehicleMetadataJsonHandler);

		instance.get('/positions', getVehiclePositionsJsonHandler);

		instance.get('/positions/gtfs', getVehiclePositionsGtfsRtJsonHandler);

		instance.get('/positions/gtfs.pb', getVehiclePositionsGtfsRtProtobufHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
