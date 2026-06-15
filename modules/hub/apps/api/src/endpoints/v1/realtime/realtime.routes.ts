/* * */

import { RealtimeController } from '@/endpoints/v1/realtime/realtime.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/realtime';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/vehicles/metadata', RealtimeController.getVehiclesMetadataJson);
		instance.get('/vehicles/positions', RealtimeController.getVehiclesPositionsJson);
		instance.get('/vehicles/positions/gtfs', RealtimeController.getVehiclesPositionsGtfsRtJson);
		instance.get('/vehicles/positions/gtfs.pb', RealtimeController.getVehiclesPositionsGtfsRtProtobuf);

		instance.get('/trip-updates', RealtimeController.getTripUpdatesGtfsRtJson);
		instance.get('/trip-updates.pb', RealtimeController.getTripUpdatesGtfsRtProtobuf);

		next();
	},
	{ prefix: namespace },
);
