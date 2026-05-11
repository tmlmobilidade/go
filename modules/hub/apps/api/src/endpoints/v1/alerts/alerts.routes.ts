/* * */

import { AlertsController } from '@/endpoints/v1/alerts/alerts.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/alerts';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', AlertsController.getJsonFeed);

		instance.get('/gtfs', AlertsController.getGtfsRtJsonFeed);

		instance.get('/gtfs.pb', AlertsController.getGtfsRtProtobufFeed);

		instance.get('.rss', AlertsController.getRssFeed);

		next();
	},
	{ prefix: namespace },
);
