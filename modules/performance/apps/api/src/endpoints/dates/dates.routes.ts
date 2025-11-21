/* * */

import { FastifyService } from '@tmlmobilidade/fastify';
import { FastifyInstance } from 'fastify';

import { DatesController } from './dates.controller.js';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/dates';

/* * */

server.register(
	(instance, opts, next) => {
		instance.get(
			'/',
			{},
			DatesController.getCalendar,
		);

		next();
	},
	{ prefix: namespace },
);
