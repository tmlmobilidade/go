/* * */

import { GtfsController } from '@/endpoints/gtfs/gtfs.controller.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/gtfs';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/parse',
			GtfsController.parse,
		);

		next();

		//
	},
	{ prefix: NAMESPACE },
);
