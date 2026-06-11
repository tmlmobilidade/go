/* * */

import { NetworkController } from '@/endpoints/v1/network/network.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/stops', NetworkController.getStops);

		instance.get('/legacy-stops-map', NetworkController.getLegacyStopsMap);

		instance.get('/lines', NetworkController.getLines);

		instance.get('/routes', NetworkController.getRoutes);

		instance.get('/patterns/:id', NetworkController.getPatterns);

		instance.get('/shapes/:id', NetworkController.getShapes);

		next();
	},
	{ prefix: namespace },
);
