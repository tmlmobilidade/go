/* * */

import { type FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getEtaAll } from './controllers/get-eta-all.js';
import { getEtaByStopIdGtfsProtobuf } from './controllers/get-eta-by-stop-id-gtfs-protobuf.js';
import { getEtaByStopIdGtfs } from './controllers/get-eta-by-stop-id-gtfs.js';
import { getEtaByStopId } from './controllers/get-eta-by-stop-id.js';
import { getEtaByTripIdGtfsProtobuf } from './controllers/get-eta-by-trip-id-gtfs-protobuf.js';
import { getEtaByTripIdGtfs } from './controllers/get-eta-by-trip-id-gtfs.js';
import { getEtaByTripId } from './controllers/get-eta-by-trip-id.js';
import { getTripUpdatesGtfsRtJson } from './controllers/get-trip-updates-gtfs-rt-json.js';
import { getTripUpdatesGtfsRtProtobuf } from './controllers/get-trip-updates-gtfs-rt-protobuf.js';
import { getVehicleMetadataJson } from './controllers/get-vehicle-metadata-json.js';
import { getVehiclePositionsGtfsRtJson } from './controllers/get-vehicle-positions-gtfs-rt-json.js';
import { getVehiclePositionsGtfsRtProtobuf } from './controllers/get-vehicle-positions-gtfs-rt-protobuf.js';
import { getVehiclePositionsJson } from './controllers/get-vehicle-positions-json.js';

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

		instance.get('/eta/gtfs.pb', getTripUpdatesGtfsRtProtobuf);
		instance.get('/eta/gtfs', getTripUpdatesGtfsRtJson);
		instance.get('/eta', getEtaAll);
		instance.get('/eta/by-trip/:id/gtfs.pb', getEtaByTripIdGtfsProtobuf);
		instance.get('/eta/by-trip/:id/gtfs', getEtaByTripIdGtfs);
		instance.get('/eta/by-trip/:id', getEtaByTripId);
		instance.get('/eta/by-stop/:id/gtfs.pb', getEtaByStopIdGtfsProtobuf);
		instance.get('/eta/by-stop/:id/gtfs', getEtaByStopIdGtfs);
		instance.get('/eta/by-stop/:id', getEtaByStopId);

		next();
	},
	{ prefix: namespace },
);
