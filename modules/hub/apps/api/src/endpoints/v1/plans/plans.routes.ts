/* * */

import { PlansController } from '@/endpoints/v1/plans/plans.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/plans';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/gtfs', PlansController.getGtfs);

		instance.get('/approved', PlansController.getApproved);

		next();
	},
	{ prefix: namespace },
);
