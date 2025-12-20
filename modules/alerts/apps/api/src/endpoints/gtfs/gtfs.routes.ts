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
			'/:agency_ids',
			GtfsController.getGtfs,
		);

		next();
	},
	{ prefix: namespace },
);
