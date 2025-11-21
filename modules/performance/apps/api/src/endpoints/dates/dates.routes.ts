/* * */

import { DatesController } from '@/endpoints/dates/dates.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/dates';

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware() },
			DatesController.getCalendar,
		);

		next();
	},
	{ prefix: namespace },
);
