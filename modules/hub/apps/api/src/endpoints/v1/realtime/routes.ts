/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getEtaAllHandler } from './handlers/get-eta-all.js';
import { getEtaByStopIdGtfsProtobufHandler } from './handlers/get-eta-by-stop-id-gtfs-protobuf.js';
import { getEtaByStopIdGtfsHandler } from './handlers/get-eta-by-stop-id-gtfs.js';
import { getEtaByStopIdHandler } from './handlers/get-eta-by-stop-id.js';
import { getEtaByTripIdGtfsProtobufHandler } from './handlers/get-eta-by-trip-id-gtfs-protobuf.js';
import { getEtaByTripIdGtfsHandler } from './handlers/get-eta-by-trip-id-gtfs.js';
import { getEtaByTripIdHandler } from './handlers/get-eta-by-trip-id.js';
import { getTripUpdatesGtfsRtJsonHandler } from './handlers/get-trip-updates-gtfs-rt-json.js';
import { getTripUpdatesGtfsRtProtobufHandler } from './handlers/get-trip-updates-gtfs-rt-protobuf.js';
import { getVehicleMetadataJsonHandler } from './handlers/get-vehicle-metadata-json.js';
import { getVehiclePositionsGtfsRtJsonHandler } from './handlers/get-vehicle-positions-gtfs-rt-json.js';
import { getVehiclePositionsGtfsRtProtobufHandler } from './handlers/get-vehicle-positions-gtfs-rt-protobuf.js';
import { getVehiclePositionsJsonHandler } from './handlers/get-vehicle-positions-json.js';

/* * */

const NAMESPACE = '/v1/realtime';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/vehicles/metadata', getVehicleMetadataJsonHandler);

		instance.get('/vehicles/positions', getVehiclePositionsJsonHandler);

		instance.get('/vehicles/positions/gtfs', getVehiclePositionsGtfsRtJsonHandler);

		instance.get('/vehicles/positions/gtfs.pb', getVehiclePositionsGtfsRtProtobufHandler);

		instance.get('/eta/gtfs.pb', getTripUpdatesGtfsRtProtobufHandler);

		instance.get('/eta/gtfs', getTripUpdatesGtfsRtJsonHandler);

		instance.get('/eta', getEtaAllHandler);

		instance.get('/eta/by-trip/:id/gtfs.pb', getEtaByTripIdGtfsProtobufHandler);

		instance.get('/eta/by-trip/:id/gtfs', getEtaByTripIdGtfsHandler);

		instance.get('/eta/by-trip/:id', getEtaByTripIdHandler);

		instance.get('/eta/by-stop/:id/gtfs.pb', getEtaByStopIdGtfsProtobufHandler);

		instance.get('/eta/by-stop/:id/gtfs', getEtaByStopIdGtfsHandler);

		instance.get('/eta/by-stop/:id', getEtaByStopIdHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
