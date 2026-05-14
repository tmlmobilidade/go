/* * */

import { FeedsController } from '@/endpoints/v1/network/feeds/feeds.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		instance.get('/gtfs-static', FeedsController.getGtfsStaticZip);
		instance.get('/dates', FeedsController.getDates);
		instance.get('/periods', FeedsController.getPeriods);
		instance.get('/stops', FeedsController.getStops);
		instance.get('/lines', FeedsController.getLines);
		instance.get('/routes', FeedsController.getRoutes);
		next();
	},
	{ prefix: '/v1/network' },
);
