/* * */

import { FastifyService } from '@tmlmobilidade/fastify';
import { FastifyInstance } from 'fastify';

import { DatesController } from './dates.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

server.register(
	(instance, opts, next) => {
		instance.get(
			'/dates',
			{},
			DatesController.getCalendar,
		);

		next();
	},
);
