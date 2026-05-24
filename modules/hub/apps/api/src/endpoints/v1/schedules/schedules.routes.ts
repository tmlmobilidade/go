/* * */

import { SchedulesController } from '@/endpoints/v1/schedules/schedules.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/schedules';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/lines', SchedulesController.getLines);

		next();
	},
	{ prefix: namespace },
);
