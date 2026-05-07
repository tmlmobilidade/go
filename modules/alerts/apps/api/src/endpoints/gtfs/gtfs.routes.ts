/* * */

import { GtfsController } from '@/endpoints/gtfs/gtfs.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/gtfs';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/carris-metropolitana',
			GtfsController.carrisMetropolitana,
		);

		instance.get(
			'/cm2',
			GtfsController.carrisMetropolitana2,
		);

		next();
	},
	{ prefix: namespace },
);
