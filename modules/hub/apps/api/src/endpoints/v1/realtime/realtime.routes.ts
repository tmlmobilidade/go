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

		instance.get('/vehicles', RealtimeController.getVehiclesJson);

		instance.get('/vehicles.pb', RealtimeController.getVehiclesProtobuf);

		next();
	},
	{ prefix: namespace },
);
