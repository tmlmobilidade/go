/* * */

import { PlansController } from '@/endpoints/v1/plans/plans.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/stops', PlansController.getGtfs);

		instance.get('/stops/:id', PlansController.getGtfs);

		instance.get('/lines', PlansController.getGtfs);

		next();
	},
	{ prefix: namespace },
);
